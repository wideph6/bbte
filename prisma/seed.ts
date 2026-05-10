/**
 * Seeds: admin user (from env), global settings singleton, one example Urdu course
 * with sample sections, instructor, testimonials and FAQs so the public site has
 * something to render right after `npm run seed`.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.adminUser.upsert({
    where: { email: adminEmail },
    update: { passwordHash },
    create: { email: adminEmail, passwordHash },
  });
  console.log(`[seed] admin user ready: ${adminEmail}`);

  await prisma.globalSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      siteTitle: "Hamare Online Courses",
      tagline: "Ilm hasil karein, apne ghar baithay",
      whatsappNumber: process.env.DEFAULT_WHATSAPP_NUMBER || "923001234567",
      footerText: "© 2026 Hamare Online Courses. Tamam huqooq mehfooz hain.",
      socialLinks: [
        { platform: "facebook", url: "https://facebook.com/" },
        { platform: "youtube", url: "https://youtube.com/" },
      ],
    },
  });
  console.log("[seed] global settings ready");

  const instructor = await prisma.instructor.upsert({
    where: { id: "seed-instructor-1" },
    update: {},
    create: {
      id: "seed-instructor-1",
      name: "Ustad Muhammad Ali",
      bio:
        "Ustad Muhammad Ali ne 15 saal se zyada arsay se tadrees ki hai. Aap ne mukhtalif universities mein lectures diye hain aur hazaron students ko kamiyabi tak pohanchaya hai.\n\nAap ki tadrees ka andaz nihayat aasaan aur amli hai, jo har student ke liye samajhna mumkin banata hai.",
      credibilityPoints: [
        "15+ saal ka tadrees ka tajurba",
        "Hazaron students ko sikhaya",
        "Online aur offline dono mein mahir",
      ],
    },
  });

  const existing = await prisma.course.findUnique({ where: { slug: "asaan-quran-fehmi" } });
  if (existing) {
    console.log("[seed] example course already exists, skipping content insert");
    return;
  }

  const course = await prisma.course.create({
    data: {
      slug: "asaan-quran-fehmi",
      title: "Asaan Quran Fehmi Course",
      subHeadline: "Quran ko samjhein apni zaban mein, sirf 8 hafton mein",
      heroImageUrl: null,
      status: "active",
      seoTitle: "Asaan Quran Fehmi Course — Online Live Classes",
      seoDescription:
        "8 hafton ka asaan online Quran fehmi course Urdu zaban mein. Live Zoom classes, qabil-e-aitabar ustad, aur lifetime recording access.",
      ctaHeading: "Aaj hi enroll karein",
      ctaSubtext: "Limited seats available — apni jagah abhi mehfooz karein.",
      instructorId: instructor.id,
      forYouPoints: {
        create: [
          { order: 0, text: "Aap Quran ko samajhna chahte hain lekin Arabi nahi jaante" },
          { order: 1, text: "Aap rozana 30 minute parhai ke liye nikal sakte hain" },
          { order: 2, text: "Aap online live classes mein dilchaspi rakhte hain" },
        ],
      },
      notForYouPoints: {
        create: [
          { order: 0, text: "Aap pehle se Arabi grammar ke mahir hain" },
          { order: 1, text: "Aap sirf tilawat seekhna chahte hain" },
        ],
      },
      learningPoints: {
        create: [
          { order: 0, text: "Quranic Arabi ke buniyadi alfaz aur grammar" },
          { order: 1, text: "Har surah ka mukhtasar tarjuma aur tafseer" },
          { order: 2, text: "Rozana ki zindagi mein Quran ka itlaaq" },
        ],
      },
      detailFields: {
        create: [
          { order: 0, label: "Qeemat", value: "PKR 4,999", isPrice: true },
          { order: 1, label: "Muddat", value: "8 Hafte" },
          { order: 2, label: "Schedule", value: "Pir, Boodh, Jumeraat — Raat 8 PM" },
          { order: 3, label: "Format", value: "Online Live (Zoom)" },
          { order: 4, label: "Level", value: "Buniyadi" },
          { order: 5, label: "Shuruat", value: "1 Jun 2026" },
        ],
      },
      testimonials: {
        create: [
          {
            order: 0,
            name: "Ayesha K.",
            text:
              "Bohat hi aasan andaz mein parhaya gaya. Pehli baar Quran ki ayaat samajh aana shuru hui hain.",
            rating: 5,
          },
          {
            order: 1,
            name: "Bilal A.",
            text: "Live classes aur recording dono ka faida mil raha hai. Recommended!",
            rating: 5,
          },
        ],
      },
      faqs: {
        create: [
          {
            order: 0,
            question: "Kya class miss karne par recording milti hai?",
            answer: "Ji haan, har class ki recording 24 ghantay ke andar email kar di jaati hai aur lifetime available rehti hai.",
          },
          {
            order: 1,
            question: "Kya certificate milta hai?",
            answer: "Ji haan, course mukammal karne par digital certificate diya jata hai.",
          },
          {
            order: 2,
            question: "Payment kaise karein?",
            answer: "WhatsApp par rabta karein, hum aap ko bank transfer, EasyPaisa aur JazzCash ki tafseelat bhej dein gay.",
          },
        ],
      },
    },
  });

  console.log(`[seed] example course created: /course/${course.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
