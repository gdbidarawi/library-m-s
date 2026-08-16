const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Book title is required'], trim: true },
    isbn: { type: String, required: [true, 'ISBN is required'], unique: true, trim: true },
    author: { type: String, required: [true, 'Author is required'], trim: true },
    publisher: { type: String, default: '' },
    category: { type: String, required: [true, 'Category is required'] },
    edition: { type: String, default: '' },
    language: { type: String, default: 'English' },
    shelfNumber: { type: String, default: '' },
    quantity: { type: Number, required: true, min: 0, default: 1 },
    available: { type: Number, required: true, min: 0, default: 1 },
    image: { type: String, default: '' },
    description: { type: String, default: '' },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

bookSchema.index({ title: 'text', author: 'text', isbn: 'text', category: 'text' });

module.exports = mongoose.model('Book', bookSchema);
