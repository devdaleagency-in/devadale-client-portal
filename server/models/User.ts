import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  _id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: 'super_admin' | 'admin' | 'client' | 'team_member' | 'onboarding';
  avatarUrl: string;
  title: string;
  isEmailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationExpires: Date | null;
  passwordResetToken: string | null;
  passwordResetExpires: Date | null;
  lastLoginAt: Date | null;
  lastLoginIp: string | null;
  isActive: boolean;
  loginAttempts: number;
  lockUntil: Date | null;
  assignedProjects: string[];
  tokenVersion: number;
  lastSeen: Date | null;
  isOnline: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    username: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: ['super_admin', 'admin', 'client', 'team_member', 'onboarding'], default: 'client' },
    avatarUrl: { type: String, default: '' },
    title: { type: String, default: '' },
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: null },
    emailVerificationExpires: { type: Date, default: null },
    passwordResetToken: { type: String, default: null },
    passwordResetExpires: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    assignedProjects: [{ type: String, ref: 'Project' }],
    tokenVersion: { type: Number, default: 0 },
    lastSeen: { type: Date, default: null },
    isOnline: { type: Boolean, default: false },
  },
  { timestamps: true, _id: false }
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isLocked = function (): boolean {
  return !!this.lockUntil && this.lockUntil > new Date();
};

userSchema.set('toJSON', {
  transform(_doc, ret: any) {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.emailVerificationExpires;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    delete ret.loginAttempts;
    delete ret.lockUntil;
    return ret;
  },
});

export default mongoose.model<IUser>('User', userSchema);
