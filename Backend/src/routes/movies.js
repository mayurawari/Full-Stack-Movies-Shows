import { Router } from "express";
import moviemodel from "../models/moviemodel.js";
import movieschema from "../validations/movievalidation.js";
import axios from "axios";

const mvroute = Router();
const TMDB_KEY = process.env.TMDB_KEY;
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

// GET all movies for the authenticated user
mvroute.get("/allmovies", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;

    const { rows, count } = await moviemodel.findAndCountAll({
      where: { userId: req.user.id },
      limit,
      offset,
      order: [["id", "DESC"]],
    });

    res.json({ items: rows, total: count });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ADD one movie (ownership enforced server-side)
mvroute.post("/addmovie", async (req, res) => {
  // 1) Validate client payload as-is (no userId)
  const { error } = movieschema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });

  // 2) Inject server-side ownership
  const payload = { ...req.body, userId: req.user.id };

  try {
    const movie = await moviemodel.create(payload);
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// ADD multiple movies (all assigned to current user)
mvroute.post("/addmultiplemovies", async (req, res) => {
  try {
    const incoming = req.body;
    if (!Array.isArray(incoming) || incoming.length === 0) {
      return res.status(400).json({ message: "Request body must be a non-empty array" });
    }

    // 1) Validate client payloads WITHOUT userId
    for (const m of incoming) {
      const { error } = movieschema.validate(m);
      if (error) return res.status(400).json({ error: error.details[0].message });
    }

    // 2) Append server-owned userId AFTER validation
    const movies = incoming.map((m) => ({ ...m, userId: req.user.id }));

    const created = await moviemodel.bulkCreate(movies, { validate: true });
    res.status(201).json(created);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});


// UPDATE a movie (only if owned by current user)
mvroute.put("/updatemovie/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // Find only if owned by current user
    const movie = await moviemodel.findOne({ where: { id, userId: req.user.id } });
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    // 1) Validate only client-editable fields (no userId)
    const { error, value } = movieschema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    // 2) Whitelist updatable keys to avoid accidental/unsafe writes
    const allowedKeys = ["title", "type", "director", "budget", "location", "duration", "year", "poster"];
    const updates = Object.fromEntries(
      Object.entries(value).filter(([k]) => allowedKeys.includes(k))
    );

    // 3) Apply update; id and userId remain unchanged
    await movie.update(updates);

    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


// DELETE a movie (only if owned by current user)
mvroute.delete("/deletemovie/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const movie = await moviemodel.findOne({
      where: { id, userId: req.user.id },
    });
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    await movie.destroy();
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TMDB search proxy (kept protected under /moviesapi)
mvroute.get("/tmdb/search/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const search = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(
        title
      )}&language=en-US&page=1`
    );

    if (!search.data.results.length)
      return res.status(404).json({ message: "Movie not found" });

    const m = search.data.results[0];

    const [details, credits] = await Promise.all([
      axios.get(
        `https://api.themoviedb.org/3/movie/${m.id}?api_key=${TMDB_KEY}&language=en-US`
      ),
      axios.get(
        `https://api.themoviedb.org/3/movie/${m.id}/credits?api_key=${TMDB_KEY}&language=en-US`
      ),
    ]);

    const director =
      credits.data.crew.find((p) => p.job === "Director")?.name || "Unknown";

    const movieData = {
      title: details.data.title,
      type: "Movie",
      director,
      budget: details.data.budget ? `$${details.data.budget}` : "N/A",
      location:
        details.data.production_countries?.map((c) => c.name).join(", ") ||
        "Unknown",
      duration: details.data.runtime
        ? `${details.data.runtime} min`
        : "Unknown",
      year: details.data.release_date?.split("-")[0] || "N/A",
      poster: m.poster_path
        ? `${TMDB_IMG}${m.poster_path}`
        : "https://via.placeholder.com/500x750?text=No+Image",
    };

    res.json(movieData);
  } catch (error) {
    console.error("TMDb Error:", error.message);
    res.status(500).json({ message: "Failed to fetch movie" });
  }
});

export default mvroute;
