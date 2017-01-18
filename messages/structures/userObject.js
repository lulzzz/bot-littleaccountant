// Reference object for a user, including their spendings
function UserObject() {
    // object type and version of the structure
    this.type = 'UserObject';
    this.typeVersion = '1.1';

    // This is a UUID for this object, issued on creation.
    this.id = '';

    // TODO: Remove this.
    // Store the user id in the database for testing / debugging reasons
    // during pre-alpha.
    this.name = '';

    // Date / time the user was created.
    this.created = new Date();
}

module.exports = UserObject;