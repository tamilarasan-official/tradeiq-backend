import { Schema, model, Types } from 'mongoose';

const researchEventSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: 'User', index: true },
    studyGroup: { type: String, enum: ['APP', 'CONTROL', 'NONE'] },
    eventType: { type: String, required: true, index: true },
    payload: { type: Schema.Types.Mixed, default: {} },
    timestamp: { type: Date, default: Date.now },
    appVersion: String,
    platform: { type: String, enum: ['android', 'ios', 'web'] },
  },
  { timestamps: true },
);

export const ResearchEvent = model('ResearchEvent', researchEventSchema);
