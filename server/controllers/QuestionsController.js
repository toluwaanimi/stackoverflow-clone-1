import Question from "../Models/Question";
import Response from "../Utils/response";
import Vote from "../Models/Vote";
import Responds from "../Models/Respond";
import Subscription from "../Models/Subscription";
import Notify from "../Events/NotificationHelper";

class QuestionsController {

  /**
   * Get All Questions
   * 
   * @param {*} req 
   * @param {*} res 
   */
  static async index(req, res) {
    const questions = await Question.find({})
    .populate({
      path: 'author',
      select: ['firstname','lastname','username','email']
    }).exec();
    return Response(res, 200,'Successfully fetched question', questions);
  }

  /**
   * Creating a new Question
   * 
   * @param {*} req 
   * @param {*} res 
   */
  static async create(req, res) {
    const { body: { title, body }, user: { _id } } = req;

    const newQestion = new Question({
      title,
      body,
      author: _id
    });

    newQestion.save(function(err, data) {
      return Response(res, 201, 'New Question Created', data);
    });
  }

  /**
   * Get a single question
   * 
   * @param {*} req 
   * @param {*} res 
   */
  static async show(req, res) {
    const { id } = req.params;

    const question = await Question.findById(id)
    .populate({
      path: 'author',
      select: ['firstname','lastname','username','email']
    })
    .exec();
    return Response(res, 200,'Successfully fetched question', question);
  }

  /**
   * Upvote a single question
   * 
   * @param {*} req 
   * @param {*} res 
   */
  static async upvote(req, res) {
    const { params: { id }, user: { _id } } = req;

    const question = await Question.findById(id);
    question.vote += 1;
    question.save();
    //Tracking user votes
    new Vote({
      user: _id,
      question: question._id,
      type: 'up'
    }).save();
    return  Response(res, 200, 'Question Upvoted!', question);
  }

  /**
   * Downvote a single question
   * 
   * @param {*} req 
   * @param {*} res 
   */
  static async downvote(req, res) {
      const { params: { id }, user: { _id } } = req;
    
      const question = await Question.findById(id);
      question.vote -= 1;
      question.save();
      //Tracking user votes
      new Vote({
        user: _id,
        question: question._id,
        type: 'down'
      }).save();
      return  Response(res, 200, 'Question Downvoted!', question);
  }

  /**
   * Respond to a question
   * 
   * @param {*} req 
   * @param {*} res 
   */
  static async respond(req, res) {
    const { params: { id }, user: { _id }, body: { body } } = req;
    const saveResponse = new Responds({
      response: body,
      user: _id,
      question: id
    });
    saveResponse.save(async function( err, data) {
      await Notify.notifyUsers(data);
      return Response(res, 201, 'New Question Response', data);
    });
  }

  /**
   * Subscribe for a question
   * 
   * @param {*} req
   * @param {*} res 
   */
  static async subscribe(req, res) {
    const { params: { id }, user: { _id } } = req;
    const newSubscription = new Subscription({
      subscriber: _id,
      question: id,
      channel: `channel-${id}`
    });
    Notify.subscribe(`channel-${id}`);
    newSubscription.save(function(err, data){
      return Response(res, 201, 'Question subscribed succesfully', data);
    });
  }
}

export default QuestionsController;
