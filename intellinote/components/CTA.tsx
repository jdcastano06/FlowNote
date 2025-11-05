"use client";

import { Button } from "./ui/button";
import { motion } from "framer-motion";

export function CTA() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div 
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary to-primary/80 p-12 md:p-16 lg:p-20"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {/* Background pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:4rem_4rem]" />
          
          <div className="relative text-center max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-5xl tracking-tight mb-6 text-primary-foreground">
              Start capturing your best ideas today
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/80 mb-10">
              Join thousands of users who have transformed the way they take notes.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                variant="secondary" 
                className="rounded-full px-8"
              >
                Download Now
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="rounded-full px-8 bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              >
                Learn More
              </Button>
            </div>

            <p className="mt-8 text-sm text-primary-foreground/70">
              No credit card required • Free forever
            </p>
          </div>

          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
