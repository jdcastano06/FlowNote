"use client";

import { Card } from "./ui/card";
import { motion } from "framer-motion";
import { Sparkles, FolderTree, Cloud, Zap, Lock, Palette } from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "Smart Organization",
    description: "Automatically categorize and tag your notes with intelligent suggestions.",
  },
  {
    icon: FolderTree,
    title: "Nested Folders",
    description: "Create unlimited nested folders and collections to keep everything tidy.",
  },
  {
    icon: Cloud,
    title: "Sync Everywhere",
    description: "Your notes sync seamlessly across all your devices in real-time.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Built for speed. Open, edit, and search your notes instantly.",
  },
  {
    icon: Lock,
    title: "Private & Secure",
    description: "End-to-end encryption keeps your thoughts safe and private.",
  },
  {
    icon: Palette,
    title: "Beautiful Design",
    description: "A minimal, distraction-free interface that gets out of your way.",
  },
];

export function Features() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-4xl md:text-5xl tracking-tight mb-6">
            Everything you need.
            <br />
            Nothing you don't.
          </h2>
          <p className="text-lg text-muted-foreground">
            Designed with simplicity in mind, powerful enough for your biggest ideas.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
            >
              <Card className="p-8 hover:shadow-lg transition-shadow duration-300 border-border/50 h-full">
                <div className="w-12 h-12 rounded-2xl bg-primary/5 flex items-center justify-center mb-6">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
