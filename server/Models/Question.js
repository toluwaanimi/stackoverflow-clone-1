import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const question = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  vote: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

question.index({body: 'text', title: 'text'});

question.query.searchQuestion = function(body) {
  return this.find({$text: {
    $search: body,
    $caseSensitive: false,
    $diacriticSensitive: false
  }});
}

const Question = mongoose.model('Question', question);

export default Question;
