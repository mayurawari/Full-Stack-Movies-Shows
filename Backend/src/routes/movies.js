import { Router } from "express";
import moviemodel from "../models/moviemodel.js";
import movieschema from "../validations/movievalidation.js";

const mvroute = Router();

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

export default mvroute;
