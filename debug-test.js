import { QAEngine } from './lib/services/qa-engine.js';

const engine = new QAEngine();
const session = engine.createSession();

console.log("Session created:", session.id);

engine.answerQuestion(session.id, 'service_type', 'move_out');
console.log("After service_type, answers:", engine.getAnswers(session.id));

engine.answerQuestion(session.id, 'property_type', 'apartment');
console.log("After property_type, answers:", engine.getAnswers(session.id));

engine.answerQuestion(session.id, 'include_photos', false);
console.log("After include_photos, answers:", engine.getAnswers(session.id));

engine.answerQuestion(session.id, 'rooms', ['bedroom', 'bathroom', 'kitchen']);
console.log("After rooms, answers:", engine.getAnswers(session.id));

const nextQ = engine.getCurrentQuestion(session.id);
console.log("Next question after all answers:", nextQ);

const updatedSession = engine.getSession(session.id);
console.log("Session isComplete:", updatedSession?.isComplete);
