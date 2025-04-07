module.exports = (dbClient, mqttClient) => {
  const router = require('express').Router();

  // API to register a door unit
  router.post('/register', async (req, res) => {
    const { mac_address, location, status_led, extra_notes } = req.body;

    try {
      const result = await dbClient.query(
        'INSERT INTO door_units (mac_address, location, status_led, extra_notes) VALUES ($1, $2, $3, $4) RETURNING id',
        [mac_address, location, status_led, extra_notes]
      );
      res.status(201).json({ message: 'Door registered', door_id: result.rows[0].id });
    } catch (err) {
      console.error('Error registering door:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Fetch all door units
  router.get('/', async (req, res) => {
    try {
      const result = await dbClient.query('SELECT * FROM door_units');
      res.status(200).json(result.rows);
    } catch (err) {
      console.error('Error fetching doors:', err);
      res.status(500).json({ error: 'Database error' });
    }
  });

  return router;
};

