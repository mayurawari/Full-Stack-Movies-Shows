import { Router } from "express";
import moviemodel from "../models/moviemodel.js";
import movieschema from "../validations/movievalidation.js";
import { config } from "dotenv";
import axios from "axios";
config();
const mvroute = Router();
const TMDB_KEY = process.env.TMDB_KEY
const TMDB_IMG = "https://image.tmdb.org/t/p/w500";

// Route to get all movies
mvroute.get("/allmovies", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const offset = parseInt(req.query.offset) || 0;
    const movies = await moviemodel.findAll({
      limit,
      offset,
      order: [["id", "DESC"]],
    });
    res.json(movies);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to add movie
mvroute.post("/addmovie", async (req, res) => {
  const { error } = movieschema.validate(req.body);
  if (error) return res.status(400).json({ error: error.details[0].message });
  try {
    const movie = await moviemodel.create(req.body);
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to add multipel movies at a time
mvroute.post("/addmultiplemovies", async (req, res) => {
  try {
    const movies = req.body;
    if (!Array.isArray(movies) || movies.length === 0)
      return res
        .status(400)
        .json({ message: "Request body must be a non-empty array" });

    // Validation for each movie
    for (const movie of movies) {
      const { error } = movieschema.validate(movie);
      if (error) return res.status(400).json({ error: error.details[0].message });
    }

    const movie = await moviemodel.bulkCreate(movies, {validate:true});
    res.status(201).json(movie);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Route to update movie
mvroute.put("/updatemovie/:id", async (req, res) => {
  try {
    const movie = await moviemodel.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });
    await movie.update(req.body);
    res.json(movie);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to delete movie
mvroute.delete("/deletemovie/:id", async (req, res) => {
  try {
    const movie = await moviemodel.findByPk(req.params.id);
    if (!movie) return res.status(404).json({ message: "Movie not found" });

    await movie.destroy();
    res.json({ message: "Deleted Successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// TMDB route to get movies
mvroute.get("/tmdb/search/:title", async (req, res) => {
  try {
    const { title } = req.params;
    const search = await axios.get(
      `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_KEY}&query=${encodeURIComponent(title)}&language=en-US&page=1`
    );

    if (!search.data.results.length)
      return res.status(404).json({ message: "Movie not found" });

    const m = search.data.results[0];

    // Fetch full details + credits
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
        details.data.production_countries
          ?.map((c) => c.name)
          .join(", ") || "Unknown",
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
