import { ReturnModelType } from '@typegoose/typegoose';

export class BaseService<T> {
  constructor(protected model: ReturnModelType<new () => T>) {}

  async findAll() {
    return this.model.find().exec();
  }

  async findById(id: string) {
    return this.model.findById(id).exec();
  }

  async create(data: Partial<T>) {
    const entity = new this.model(data);
    return entity.save();
  }

  async update(id: string, data: Partial<T>) {
    return this.model.findByIdAndUpdate(
      id,
      { ...data, updated_at: new Date() },
      { new: true }
    ).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.model.findByIdAndUpdate(
      id,
      { deleted_at: new Date() },
      { new: true }
    ).exec();
    return !!result;
  }
}
