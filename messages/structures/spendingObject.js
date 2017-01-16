// Reference object for a single spending
function SpendingObject() {
    // object type
    this.type = 'SpendingObject';

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