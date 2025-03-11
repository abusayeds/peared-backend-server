import { IAbout } from "./About.interface";
import { AboutModel } from "./About.model";


export const createAboutInDB = async (payload: IAbout) => {
  const crateAbout = AboutModel.create(payload);
  return crateAbout;
};

export const getAllAboutFromDB = async () => {
  const about = await AboutModel.find().sort({ createdAt: -1 });
  return about;
};

export const updateAboutInDB = async (newData: string) => {
  const updatedAbout = await AboutModel.findOneAndUpdate(
    {},
    { description: newData },
    { new: true, upsert: true },
  );

  return updatedAbout;
};
