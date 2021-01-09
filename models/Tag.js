const { Schema, model, Types } = require('mongoose')

const tagSchema = new Schema({
  tag: { type: String, required: true, unique: true },
  date: { type: Date, default: Date.now },
  cards: [{ type: Types.ObjectId, ref: 'Card' }],
})

module.exports = model('Tag', tagSchema)
