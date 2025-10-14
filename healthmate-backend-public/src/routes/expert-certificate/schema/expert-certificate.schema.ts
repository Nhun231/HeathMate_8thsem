import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import mongoose from 'mongoose';
import { CertificateStatus } from 'src/shared/constants/expert.constant';
import { User } from 'src/shared/schemas/user.schema';

@Schema({ timestamps: { updatedAt: true } })
export class ExpertCertificate {
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: User.name,
    required: true,
  })
  user: Types.ObjectId;

  @Prop({
    type: String,
    required: true,
  })
  certificateURLKey: string;

  @Prop({
    type: String,
    enum: [
      CertificateStatus.Pending,
      CertificateStatus.Approved,
      CertificateStatus.Rejected,
    ],
    default: CertificateStatus.Pending,
  })
  status: string;

  @Prop({ type: Date })
  submittedAt: Date;

  @Prop({ type: Date })
  approvesAt: Date;
}

export const ExpertCertificateSchema =
  SchemaFactory.createForClass(ExpertCertificate);

export type ExpertCertificateDocument = HydratedDocument<ExpertCertificate>;

ExpertCertificateSchema.pre('save', function (next) {
  if (this.isNew) {
    this.submittedAt = new Date();
  }

  if (this.isModified('status') && this.status === CertificateStatus.Approved) {
    this.approvesAt = new Date();
  }

  next();
});
