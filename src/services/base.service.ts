import { ReturnModelType } from '@typegoose/typegoose';

export class BaseService<T> {
  constructor(protected model: ReturnModelType<new () => T>) {}

  async findAll(userId: string | null) {
    return this.model.find({ deleted_at: { $exists: false }, 
      $or: [
      { userId },
      { isPrivate: false }
    ] }).exec();
  }

  async findById(id: string, userId: string | null) {
    return this.model.findOne({
      _id: id,
      deleted_at: { $exists: false },
      $or: [{ userId }, { isPrivate: false }],
    }).exec();
  }

  async create(data: Partial<T>,userId:string) {
    const entity = new this.model({...data,userId});
    return entity.save();
  }

  async update(id: string, data: Partial<T>,userId:string) {
    return this.model.findOneAndUpdate(
      { _id: id, deleted_at: { $exists: false }, userId },
      { ...data, updated_at: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string,userId:string): Promise<boolean> {
    const result = await this.model.findOneAndUpdate(
      { _id: id, deleted_at: { $exists: false }, userId },
      { deleted_at: new Date() },
      { new: true }
    ).exec();
    return !!result;
  }

  /**Internal route, not accessible to the public */
  async hardDelete(id: string): Promise<boolean> {
    const result = await this.model.findOneAndDelete({ 
      _id: id,  
    }).exec();
    return !!result;
  }
}
