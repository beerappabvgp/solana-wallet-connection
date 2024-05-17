import * as borsh from '@project-serum/borsh'

export class StudentIntro {
  constructor(public name : string , public message : string) {
    this.name = name;
    this.message = message;
  }
  // serializing the schema 
  borshInstructionSchema = borsh.struct([
    borsh.u8('variant'),
    borsh.str('name'),
    borsh.str('message'),
  ]);

  static borshAccountSchema = borsh.struct([
    borsh.u8('initialized'),
    borsh.str('name'),
    borsh.str('message'),
  ]);

  serialize() : Buffer {
    const buffer = Buffer.alloc(1000);
    this.borshInstructionSchema.encode({ ...this, variant: 0 }, buffer);
    return buffer.slice(0 , this.borshInstructionSchema.getSpan(buffer));
  }  

  // deserializing the schema 
  static deserialize(buffer ?: Buffer) : StudentIntro | null {
    if(!buffer) {
      return null;
    }
    try {
      const { name , message } = this.borshAccountSchema.decode(buffer);
      return new StudentIntro(name , message);
    } catch (error) {
      console.log(error);
      return null;
    }
  }
}