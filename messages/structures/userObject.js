// Reference object for a user, including their spendings
function UserObject() {
    // object type and version of the structure
    this.type = 'UserObject';
    this.typeVersion = '1.1';

    // This is a UUID for this object, issued on creation.
    this.id = '';
}

module.exports = UserObject;