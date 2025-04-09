//jwtConfig.js

function configError(message) {
    throw new Error(message);
}

module.exports = {
    jwtKey:
        process.env.JWT_SECRET ?? configError("environment variable JWT_KEY is missing ")
}