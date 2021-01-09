const { Schema, model, Types } = require('mongoose')

const cardSchema = new Schema({
  title: { type: String, required: true },
  image: { type: String, required: true },
  tags: [{ type: Types.ObjectId, ref: 'Tag' }],
  description: { type: String, default: '' },
  date: { type: Date, default: Date.now },
  creator: { type: Types.ObjectId, ref: 'User', required: true },
})

module.exports = model('Card', cardSchema)
