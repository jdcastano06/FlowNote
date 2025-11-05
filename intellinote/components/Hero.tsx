"use client";

import { Button } from "./ui/button";
import { motion } from "framer-motion";
import { FileText, Search, Star, Calendar, Plus, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 via-purple-50/30 to-background pointer-events-none" />
      
      <div className="relative max-w-7xl mx-auto px-6 py-12 md:py-16">
        <motion.div 
          className="text-center max-w-4xl mx-auto mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/5 border border-border/50 mb-6"
          >
            <span className="text-xs text-muted-foreground">Web-based note taking</span>
            <ArrowRight className="w-3 h-3 text-muted-foreground" />
          </motion.div>

          {/* Main headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl tracking-tight mb-6 px-4">
            Your thoughts,
            <br />
            beautifully organized
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            A simple, elegant web app that helps you capture ideas and stay focused on what matters.
          </p>

          {/* CTA Button */}
          <motion.div 
            className="flex justify-center"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            <Button size="lg" className="rounded-lg px-8">
              Get Started Free
            </Button>
          </motion.div>
        </motion.div>

        {/* App Preview - No Tilt, Flat Design */}
        <motion.div 
          className="relative max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Browser-like window */}
          <div className="bg-card rounded-2xl shadow-2xl border border-border overflow-hidden">
            {/* Window header */}
            <div className="bg-muted/30 px-4 py-3 flex items-center gap-2 border-b border-border">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 text-center text-sm text-muted-foreground">
                app.notesflow.com
              </div>
            </div>

            {/* App content */}
            <div className="flex h-[500px] lg:h-[600px]">
              {/* Sidebar */}
              <div className="w-56 lg:w-64 bg-muted/20 border-r border-border p-4">
                <div className="mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Search notes...</span>
                  </div>
                </div>

                <div className="mb-4">
                  <Button size="sm" className="w-full justify-start gap-2">
                    <Plus className="w-4 h-4" />
                    New Note
                  </Button>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-primary text-primary-foreground">
                    <FileText className="w-4 h-4" />
                    <span className="text-sm">All Notes</span>
                    <span className="ml-auto text-xs">42</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">Favorites</span>
                    <span className="ml-auto text-xs text-muted-foreground">8</span>
                  </div>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">Recent</span>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="text-xs text-muted-foreground px-3 mb-2">Folders</div>
                  <div className="space-y-1">
                    <div className="px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors text-sm">
                      Work Projects
                    </div>
                    <div className="px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors text-sm">
                      Personal
                    </div>
                    <div className="px-3 py-2 rounded-lg hover:bg-accent/50 transition-colors text-sm">
                      Ideas
                    </div>
                  </div>
                </div>
              </div>

              {/* Main content area */}
              <div className="flex-1 p-8 lg:p-12">
                <div className="mb-8">
                  <h3 className="mb-2 text-2xl lg:text-3xl">Welcome to NotesFlow</h3>
                  <p className="text-sm text-muted-foreground">Last edited 2 hours ago</p>
                </div>
                
                <div className="space-y-4">
                  <div className="h-4 bg-muted/50 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-5/6" />
                  <div className="h-4 bg-muted/50 rounded w-4/6" />
                  <div className="mt-8 h-4 bg-muted/50 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-3/6" />
                  <div className="mt-8 h-4 bg-muted/50 rounded w-5/6" />
                  <div className="h-4 bg-muted/50 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-2/6" />
                </div>
              </div>
            </div>
          </div>

          {/* Decorative blur elements */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
