// Reference object for a single spending
function SpendingObject() {
    // object type and version of the structure
    this.type = 'SpendingObject';
    this.typeVersion = '1.1';

    // This is a UUID for this object, issued on creation.
    this.id = '';

    // User associated with the spending.
    this.user = '';

    // Amount the user has spent.
    this.amount = 0.0;

    // Currency of this secific spending.
    this.currency = '';

    // Topics associated with this spending.
    this.topics = [];

    // The date / time the spending happened.
    this.date = new Date();
}

module.exports = SpendingObject;