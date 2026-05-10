/**
 * Centralized config for all per-course sub-collections so a single dynamic
 * route can serve CRUD for forYouPoints, notForYouPoints, learningPoints,
 * detailFields, testimonials, and faqs without one route file each.
 */
import { z } from "zod";
import { prisma } from "./prisma";

type Delegate = {
  create: (args: { data: any }) => Promise<any>;
  update: (args: { where: { id: string }; data: any }) => Promise<any>;
  delete: (args: { where: { id: string } }) => Promise<any>;
};

interface SectionDef {
  delegate: () => Delegate;
  createSchema: z.ZodTypeAny;
  patchSchema: z.ZodTypeAny;
}

export const SECTIONS: Record<string, SectionDef> = {
  forYouPoints: {
    delegate: () => prisma.forYouPoint as unknown as Delegate,
    createSchema: z.object({ text: z.string().min(1) }),
    patchSchema: z.object({ text: z.string().min(1).optional() }),
  },
  notForYouPoints: {
    delegate: () => prisma.notForYouPoint as unknown as Delegate,
    createSchema: z.object({ text: z.string().min(1) }),
    patchSchema: z.object({ text: z.string().min(1).optional() }),
  },
  learningPoints: {
    delegate: () => prisma.learningPoint as unknown as Delegate,
    createSchema: z.object({ text: z.string().min(1) }),
    patchSchema: z.object({ text: z.string().min(1).optional() }),
  },
  detailFields: {
    delegate: () => prisma.detailField as unknown as Delegate,
    createSchema: z.object({
      label: z.string().min(1),
      value: z.string(),
      isPrice: z.boolean().optional(),
    }),
    patchSchema: z.object({
      label: z.string().min(1).optional(),
      value: z.string().optional(),
      isPrice: z.boolean().optional(),
    }),
  },
  testimonials: {
    delegate: () => prisma.testimonial as unknown as Delegate,
    createSchema: z.object({
      name: z.string().min(1),
      text: z.string().min(1),
      rating: z.number().int().min(0).max(5).nullable().optional(),
      photoUrl: z.string().url().nullable().optional(),
    }),
    patchSchema: z.object({
      name: z.string().min(1).optional(),
      text: z.string().min(1).optional(),
      rating: z.number().int().min(0).max(5).nullable().optional(),
      photoUrl: z.string().url().nullable().optional(),
    }),
  },
  faqs: {
    delegate: () => prisma.faq as unknown as Delegate,
    createSchema: z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    }),
    patchSchema: z.object({
      question: z.string().min(1).optional(),
      answer: z.string().min(1).optional(),
    }),
  },
};

export function isSection(name: string): name is keyof typeof SECTIONS {
  return Object.prototype.hasOwnProperty.call(SECTIONS, name);
}
