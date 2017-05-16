class EntitiesError extends Error{
  constructor(id, message){
    super(message);
    this.message = message;
    this.id = id
    this.name = 'EntitiesError'
  }
}

module.exports = {
  EntitiesError: EntitiesError
}
