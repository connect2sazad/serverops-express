import express from 'express';

const router = express.Router();

router.get("/users", (req, res) => {
  res.json({
    message: "Get all users",
  });
});

router.post("/users", (req, res) => {
  res.json({
    message: "Create user",
  });
});

router.get("/users/:id", (req, res) => {
  res.json({
    message: `Get user ${req.params.id}`,
  });
});

export default router;
