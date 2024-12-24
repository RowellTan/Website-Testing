// OrderIDGeneration.js
(function () {
    // Generate a random Order ID
    function generateOrderID() {
        return 'ORD-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // Expose the function globally
    window.generateOrderID = generateOrderID;
})();

