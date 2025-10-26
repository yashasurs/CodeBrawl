const asyncHandler = (fn) => async (req, res, next) => {
    try {
        await fn(req, res, next)
    } catch (error) {
        // Defensive check: ensure res exists before trying to use it
        if (res && typeof res.status === 'function') {
            res.status(error.statusCode || 500).json({
                success: false,
                message: error.message
            })
        } else {
            // If res is not available, log error and pass to next middleware
            console.error('AsyncHandler error (no response object):', error);
            if (next && typeof next === 'function') {
                next(error);
            }
        }
    }
}

export default asyncHandler;