/**
 * Property controller — Phase 2 will implement real database queries.
 * Placeholders return structured responses so the frontend can be wired up later.
 */

export const getAllProperties = async (req, res) => {
  res.status(501).json({
    message: "Not implemented yet — Phase 2 will return all properties from MongoDB",
  });
};

export const getPropertyBySlug = async (req, res) => {
  res.status(501).json({
    message: `Not implemented yet — Phase 2 will return property: ${req.params.slug}`,
  });
};

export const getPropertyAvailability = async (req, res) => {
  res.status(501).json({
    message: "Not implemented yet — Phase 3 will return booked date ranges",
  });
};
