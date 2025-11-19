"use client";

import { motion } from "framer-motion";
import { FileText, Search, Star, Calendar } from "lucide-react";

export function AppPreview() {
  return (
    <section className="py-24 md:py-32 bg-gradient-to-b from-background via-muted/20 to-background">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl md:text-5xl tracking-tight mb-6">
            A workspace that adapts to you
          </h2>
          <p className="text-lg text-muted-foreground">
            Clean interface, powerful features. See your ideas come to life.
          </p>
        </div>

        {/* App mockup */}
        <motion.div 
          className="relative max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
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
                NotesFlow
              </div>
            </div>

            {/* App content */}
            <div className="flex h-[500px]">
              {/* Sidebar */}
              <div className="w-64 bg-muted/20 border-r border-border p-4">
                <div className="mb-6">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border mb-4">
                    <Search className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Search notes...</span>
                  </div>
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
              <div className="flex-1 p-8">
                <div className="mb-8">
                  <h3 className="mb-2 text-2xl">Welcome to NotesFlow</h3>
                  <p className="text-sm text-muted-foreground">Last edited 2 hours ago</p>
                </div>
                
                <div className="space-y-4 text-muted-foreground">
                  <div className="h-4 bg-muted/50 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-5/6" />
                  <div className="h-4 bg-muted/50 rounded w-4/6" />
                  <div className="mt-8 h-4 bg-muted/50 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-full" />
                  <div className="h-4 bg-muted/50 rounded w-3/6" />
                </div>
              </div>
            </div>
          </div>

          {/* Decorative blur elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -z-10" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />
        </motion.div>
      </div>
    </section>
  );
}
