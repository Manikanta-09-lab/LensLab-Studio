
const express = require('express');
const { initializeDB, getDB } = require('./database');

const app = express();

app.use(express.json());

// Welcome route
app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to LensLab Studio API'
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'Server is running successfully'
    });
});

const PORT = 3000;



// Get all cameras with search and sorting
app.get('/cameras', async (req, res) => {
    try {
        const db = getDB();

        const { brand, kind, search, sort, order } = req.query;

        let query = 'SELECT * FROM cameras WHERE 1 = 1';
        const params = [];

        // Search by brand
        if (brand) {
            query += ' AND brand = ?';
            params.push(brand);
        }

        // Search by camera type
        if (kind) {
            query += ' AND kind = ?';
            params.push(kind);
        }

        // Search by name or brand
        if (search) {
            query += ' AND (name LIKE ? OR brand LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Sorting validation
if (sort && sort !== 'name') {
    return res.status(400).json({
        error: 'Cannot sort by that field'
    });
}

        if (order && !['asc', 'desc'].includes(order.toLowerCase())) {
            return res.status(400).json({
                error: 'Invalid sort order'
            });
        }

        // Apply sorting
        if (sort === 'name') {
            const sortOrder = (order || 'asc').toUpperCase();
            query += ` ORDER BY name ${sortOrder}`;
        }

        const cameras = await db.all(query, params);

        res.status(200).json(cameras);

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});



// Add a new camera
app.post('/cameras', async (req, res) => {
    try {
        const db = getDB();

        const {
            name,
            kind,
            brand,
            daily_rate,
            status
        } = req.body;

        // Validate required text fields
if (
    typeof name !== 'string' || name.trim() === '' ||
    typeof kind !== 'string' || kind.trim() === '' ||
    typeof brand !== 'string' || brand.trim() === ''
) {
    return res.status(400).json({
        error: 'Name, kind and brand must be valid text'
    });
}

// Validate daily rate
if (
    typeof daily_rate !== 'number' ||
    !Number.isFinite(daily_rate) ||
    daily_rate <= 0
) {
    return res.status(400).json({
        error: 'Daily rate must be a positive number'
    });
}

// Validate status if provided
if (
    status !== undefined &&
    (typeof status !== 'string' || status.trim() === '')
) {
    return res.status(400).json({
        error: 'Status must be valid text'
    });
}

        const result = await db.run(
            `INSERT INTO cameras
            (name, kind, brand, daily_rate, status)
            VALUES (?, ?, ?, ?, ?)`,
            [name, kind, brand, daily_rate, status || 'Available']
        );

        res.status(201).json({
            message: 'Camera added successfully',
            cameraId: result.lastID
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get a camera by ID
app.get('/cameras/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        const camera = await db.get(
            'SELECT * FROM cameras WHERE id = ?',
            [id]
        );

        if (!camera) {
            return res.status(404).json({
                error: 'Camera not found'
            });
        }

        res.status(200).json(camera);

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Update a camera
app.put('/cameras/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        const {
            name,
            kind,
            brand,
            daily_rate,
            status
        } = req.body;

        if (!name || !kind || !brand || daily_rate === undefined || !status) {
            return res.status(400).json({
                error: 'All camera details are required'
            });
        }

        if (typeof daily_rate !== 'number' || daily_rate <= 0) {
            return res.status(400).json({
                error: 'Daily rate must be a positive number'
            });
        }

        const existingCamera = await db.get(
            'SELECT * FROM cameras WHERE id = ?',
            [id]
        );

        if (!existingCamera) {
            return res.status(404).json({
                error: 'Camera not found'
            });
        }

        await db.run(
            `UPDATE cameras
             SET name = ?, kind = ?, brand = ?, daily_rate = ?, status = ?
             WHERE id = ?`,
            [name, kind, brand, daily_rate, status, id]
        );

        res.status(200).json({
            message: 'Camera updated successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Delete a camera
app.delete('/cameras/:id', async (req, res) => {
    try {
        const db = getDB();
        const { id } = req.params;

        const existingCamera = await db.get(
            'SELECT * FROM cameras WHERE id = ?',
            [id]
        );

        if (!existingCamera) {
            return res.status(404).json({
                error: 'Camera not found'
            });
        }

        await db.run(
            'DELETE FROM cameras WHERE id = ?',
            [id]
        );

        res.status(200).json({
            message: 'Camera deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// Get all photographers
app.get('/photographers', async (req, res) => {
    try {
        const db = getDB();

        const photographers = await db.all(
            'SELECT * FROM photographers'
        );

        res.status(200).json(photographers);

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// Add a new photographer
app.post('/photographers', async (req, res) => {
    try {
        const db = getDB();

        const { name, phone, email } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                error: 'Name and phone are required'
            });
        }

        const result = await db.run(
            `INSERT INTO photographers (name, phone, email)
             VALUES (?, ?, ?)`,
            [name, phone, email || null]
        );

        res.status(201).json({
            message: 'Photographer added successfully',
            photographerId: result.lastID
        });

    } catch (error) {
        if (error.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({
                error: 'Email already exists'
            });
        }

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Get photographer by ID
app.get('/photographers/:id', async (req, res) => {
    try {
        const db = getDB();

        const { id } = req.params;

        const photographer = await db.get(
            'SELECT * FROM photographers WHERE id = ?',
            [id]
        );

        if (!photographer) {
            return res.status(404).json({
                error: 'Photographer not found'
            });
        }

        res.status(200).json(photographer);

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// Update photographer
app.put('/photographers/:id', async (req, res) => {
    try {
        const db = getDB();

        const { id } = req.params;
        const { name, phone, email } = req.body;

        if (!name || !phone) {
            return res.status(400).json({
                error: 'Name and phone are required'
            });
        }

        const photographer = await db.get(
            'SELECT * FROM photographers WHERE id = ?',
            [id]
        );

        if (!photographer) {
            return res.status(404).json({
                error: 'Photographer not found'
            });
        }

        await db.run(
            `UPDATE photographers
             SET name = ?, phone = ?, email = ?
             WHERE id = ?`,
            [name, phone, email || null, id]
        );

        res.status(200).json({
            message: 'Photographer updated successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});



// Delete photographer
app.delete('/photographers/:id', async (req, res) => {
    try {
        const db = getDB();

        const { id } = req.params;

        const photographer = await db.get(
            'SELECT * FROM photographers WHERE id = ?',
            [id]
        );

        if (!photographer) {
            return res.status(404).json({
                error: 'Photographer not found'
            });
        }

        await db.run(
            'DELETE FROM photographers WHERE id = ?',
            [id]
        );

        res.status(200).json({
            message: 'Photographer deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// Add a new rental
app.post('/rentals', async (req, res) => {
    try {
        const db = getDB();

        const {
            photographer_id,
            camera_id,
            start_date,
            end_date,
            total_cost
        } = req.body;

        if (
            !photographer_id ||
            !camera_id ||
            !start_date ||
            !end_date ||
            total_cost === undefined
        ) {
            return res.status(400).json({
                error: 'All rental fields are required'
            });
        }

        if (
            !Number.isFinite(Number(total_cost)) ||
            Number(total_cost) <= 0
        ) {
            return res.status(400).json({
                error: 'Total cost must be a positive number'
            });
        }

        if (new Date(end_date) < new Date(start_date)) {
            return res.status(400).json({
                error: 'End date cannot be before start date'
            });
        }

        const result = await db.run(
            `INSERT INTO rentals
            (photographer_id, camera_id, start_date, end_date, total_cost)
            VALUES (?, ?, ?, ?, ?)`,
            [
                photographer_id,
                camera_id,
                start_date,
                end_date,
                Number(total_cost)
            ]
        );

        res.status(201).json({
            message: 'Rental created successfully',
            rentalId: result.lastID
        });

    } catch (error) {
       if (error.message.includes('FOREIGN KEY constraint failed')) {
    return res.status(400).json({
        error: 'Invalid photographer ID or camera ID'
    });
}

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// Get all rentals
app.get('/rentals', async (req, res) => {
    try {
        const db = getDB();

        const rentals = await db.all(
            'SELECT * FROM rentals'
        );

        res.status(200).json(rentals);

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// Get rental by ID
app.get('/rentals/:id', async (req, res) => {
    try {
        const db = getDB();

        const { id } = req.params;

        const rental = await db.get(
            'SELECT * FROM rentals WHERE id = ?',
            [id]
        );

        if (!rental) {
            return res.status(404).json({
                error: 'Rental not found'
            });
        }

        res.status(200).json(rental);

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});


// Update rental
app.put('/rentals/:id', async (req, res) => {
    try {
        const db = getDB();

        const { id } = req.params;

        const {
            photographer_id,
            camera_id,
            start_date,
            end_date,
            total_cost
        } = req.body;

        if (
            !photographer_id ||
            !camera_id ||
            !start_date ||
            !end_date ||
            total_cost === undefined
        ) {
            return res.status(400).json({
                error: 'All rental fields are required'
            });
        }

        if (
            !Number.isFinite(Number(total_cost)) ||
            Number(total_cost) <= 0
        ) {
            return res.status(400).json({
                error: 'Total cost must be a positive number'
            });
        }

        if (new Date(end_date) < new Date(start_date)) {
            return res.status(400).json({
                error: 'End date cannot be before start date'
            });
        }

        const rental = await db.get(
            'SELECT * FROM rentals WHERE id = ?',
            [id]
        );

        if (!rental) {
            return res.status(404).json({
                error: 'Rental not found'
            });
        }

        await db.run(
            `UPDATE rentals
             SET photographer_id = ?, camera_id = ?,
                 start_date = ?, end_date = ?, total_cost = ?
             WHERE id = ?`,
            [
                photographer_id,
                camera_id,
                start_date,
                end_date,
                Number(total_cost),
                id
            ]
        );

        res.status(200).json({
            message: 'Rental updated successfully'
        });

    } catch (error) {
        if (error.message.includes('FOREIGN KEY constraint failed')) {
            return res.status(400).json({
                error: 'Invalid photographer ID or camera ID'
            });
        }

        res.status(500).json({
            error: 'Internal server error'
        });
    }
});

// Delete rental
app.delete('/rentals/:id', async (req, res) => {
    try {
        const db = getDB();

        const { id } = req.params;

        const rental = await db.get(
            'SELECT * FROM rentals WHERE id = ?',
            [id]
        );

        if (!rental) {
            return res.status(404).json({
                error: 'Rental not found'
            });
        }

        await db.run(
            'DELETE FROM rentals WHERE id = ?',
            [id]
        );

        res.status(200).json({
            message: 'Rental deleted successfully'
        });

    } catch (error) {
        res.status(500).json({
            error: 'Internal server error'
        });
    }
});



// Initialize database before starting server
const startServer = async () => {
    try {
        await initializeDB();

        app.listen(PORT, () => {
            console.log(`LensLab Studio server running at http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Unable to start server:', error.message);
        process.exit(1);
    }
};

startServer();
