/**
 * Seed global service + education catalogs.
 * Usage: node -r ./polyfill.cjs -r ts-node/register src/scripts/seedCatalog.ts
 * Or: npx ts-node -r ./polyfill.cjs src/scripts/seedCatalog.ts
 */
const dns = require("dns");
dns.setServers(["8.8.8.8", "1.1.1.1"]);
dns.setDefaultResultOrder("ipv4first");

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { EducationCatalogModel, ServiceCatalogModel } from "../modules/make_modules/catalog/catalog.model";
import catagoryModel from "../modules/make_modules/addProject/projectCatagory/ctegory.model";

dotenv.config({ path: path.join(process.cwd(), ".env") });

const SERVICES = [
  // Home & property
  "Residential Cleaning", "Commercial Cleaning", "Deep Cleaning", "Move-in / Move-out Cleaning",
  "Carpet Cleaning", "Window Cleaning", "Pressure Washing", "Junk Removal", "Organizing / Decluttering",
  "House Sitting", "Pet Sitting", "Dog Walking",
  "Painting", "Interior Painting", "Exterior Painting", "Drywall Repair", "Wallpaper Installation",
  "Plumbing", "Electrical Work", "HVAC", "Appliance Repair", "Handyman", "Furniture Assembly",
  "Locksmith", "Roofing", "Flooring", "Tiling", "Carpentry", "Cabinet Installation",
  "Landscaping", "Lawn Care", "Tree Trimming", "Gardening", "Snow Removal", "Pool Cleaning",
  "Pest Control", "Mold Remediation", "Water Damage Restoration",
  "Moving Services", "Packing Services", "Storage Help",
  // Tech & digital
  "Web Development", "Mobile App Development", "Software Development", "Frontend Development",
  "Backend Development", "Full Stack Development", "WordPress Development", "Shopify Development",
  "UI/UX Design", "Graphic Design", "Logo Design", "Brand Identity", "Illustration",
  "Motion Graphics", "Video Editing", "Animation", "3D Modeling", "Photography", "Photo Editing",
  "Digital Marketing", "SEO", "Social Media Management", "Content Writing", "Copywriting",
  "Technical Writing", "Translation", "Transcription",
  "IT Support", "Computer Repair", "Network Setup", "Cybersecurity", "Data Entry",
  "Virtual Assistant", "Customer Support", "Chatbot Setup", "AI Prompt Engineering",
  "Game Development", "QA Testing", "DevOps", "Cloud Consulting", "Database Administration",
  // Business & professional
  "Accounting", "Bookkeeping", "Tax Preparation", "Financial Consulting", "Business Consulting",
  "Legal Consulting", "Notary Services", "HR Consulting", "Recruiting", "Career Coaching",
  "Project Management", "Product Management", "Market Research", "Sales Consulting",
  "Presentation Design", "Pitch Deck Design", "Business Plan Writing",
  // Education & coaching
  "Tutoring", "Math Tutoring", "Science Tutoring", "Language Tutoring", "Test Prep",
  "Music Lessons", "Guitar Lessons", "Piano Lessons", "Vocal Coaching", "Dance Lessons",
  "Fitness Training", "Yoga Instruction", "Personal Training", "Nutrition Coaching",
  "Life Coaching", "Public Speaking Coaching", "Driving Lessons",
  // Creative & events
  "Event Planning", "Wedding Planning", "Catering", "Bartending", "DJ Services",
  "Live Music", "Makeup Artistry", "Hair Styling", "Fashion Design", "Tailoring",
  "Interior Design", "Home Staging", "Floral Design",
  // Automotive & transport
  "Car Detailing", "Auto Repair", "Oil Change", "Tire Services", "Mobile Mechanic",
  "Rideshare / Chauffeur", "Delivery Services", "Courier",
  // Health & care
  "Elderly Care", "Child Care", "Babysitting", "Nursing Support", "Physiotherapy Support",
  "Massage Therapy", "Acne / Skincare Services",
  // Misc trades
  "Welding", "Metalwork", "Glass Installation", "Security System Installation",
  "Smart Home Setup", "CCTV Installation", "Solar Panel Installation",
  "Printing Services", "Signage", "Embroidery", "Custom Merchandise",
];

const EDUCATIONS = [
  "High School Diploma", "GED", "Associate Degree", "Bachelor's Degree", "Master's Degree",
  "Doctorate / PhD", "MBA", "MD", "JD / Law Degree", "Nursing Degree (BSN/RN)",
  "Trade School Certificate", "Apprenticeship", "Vocational Training",
  "Bootcamp Certificate", "Online Course Certificate", "Professional Certificate",
  "CompTIA A+", "CompTIA Network+", "CompTIA Security+", "AWS Certified", "Google Cloud Certified",
  "Azure Certified", "Cisco CCNA", "PMP", "Scrum Master", "Six Sigma",
  "CPA", "CFA", "SHRM-CP", "First Aid / CPR", "OSHA 10", "OSHA 30",
  "CDL License", "Real Estate License", "Electrician License", "Plumbing License",
  "HVAC Certification", "Cosmetology License", "Food Handler Certificate",
  "Teaching Certificate", "TESOL / TEFL", "Adobe Certified", "Autodesk Certified",
  "No Formal Education", "Self-taught", "Currently Enrolled",
];

async function upsertList(Model: any, names: string[]) {
  let created = 0;
  for (const raw of names) {
    const name = raw.trim().replace(/\s+/g, " ");
    const nameLower = name.toLowerCase();
    const res = await Model.updateOne(
      { nameLower },
      { $setOnInsert: { name, nameLower } },
      { upsert: true }
    );
    if (res.upsertedCount) created += 1;
  }
  return created;
}

(async () => {
  const uri = process.env.DATABASE_URL;
  if (!uri) throw new Error("DATABASE_URL missing");
  await mongoose.connect(uri, { family: 4 } as any);

  const sCreated = await upsertList(ServiceCatalogModel, SERVICES);
  const eCreated = await upsertList(EducationCatalogModel, EDUCATIONS);

  // Sync services into legacy catagory collection
  for (const raw of SERVICES) {
    const name = raw.trim();
    const exists = await catagoryModel.findOne({
      catagory: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
    });
    if (!exists) await catagoryModel.create({ catagory: name });
  }

  console.log(`Services upserted (new): ${sCreated}, total seed size: ${SERVICES.length}`);
  console.log(`Educations upserted (new): ${eCreated}, total seed size: ${EDUCATIONS.length}`);
  await mongoose.disconnect();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
