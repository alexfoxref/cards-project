const { Schema, model, Types } = require('mongoose')

const sessionSchema = new Schema({
  user: { type: Types.ObjectId, ref: 'User' },
  refresh_token: { type: String, required: true, unique: true },
})

module.exports = model('Session', sessionSchema)
