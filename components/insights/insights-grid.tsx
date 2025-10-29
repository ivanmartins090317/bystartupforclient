"use client";

import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Headphones, Play, Video} from "lucide-react";
import {format} from "date-fns";
import {ptBR} from "date-fns/locale";
import type {Insight, InsightType} from "@/types";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {EmptyState} from "@/components/shared/empty-state";

interface InsightsGridProps {
  insights: Insight[];
}

export function InsightsGrid({insights}: InsightsGridProps) {
  const podcasts = insights.filter((i) => i.type === "podcast");
  const videos = insights.filter((i) => i.type === "video");

  return (
    <Tabs defaultValue="all" className="space-y-6">
      <TabsList>
        <TabsTrigger value="all">Todos ({insights.length})</TabsTrigger>
        <TabsTrigger value="podcasts">
          <Headphones className="h-4 w-4 mr-1" />
          Podcasts ({podcasts.length})
        </TabsTrigger>
        <TabsTrigger value="videos">
          <Video className="h-4 w-4 mr-1" />
          Vídeos ({videos.length})
        </TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-4">
        {insights.length === 0 ? (
          <InsightsEmptyState />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="podcasts" className="space-y-4">
        {podcasts.length === 0 ? (
          <InsightsEmptyState type="podcast" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {podcasts.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="videos" className="space-y-4">
        {videos.length === 0 ? (
          <InsightsEmptyState type="video" />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {videos.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
}

interface InsightCardProps {
  insight: Insight;
}

function InsightCard({insight}: InsightCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  function formatDuration(seconds: number) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  return (
    <Card className="hover:shadow-lg transition-shadow group overflow-hidden">
      <div className="relative aspect-video bg-gray-100">
        {insight.thumbnail_url ? (
          <img
            src={insight.thumbnail_url}
            alt={insight.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-secondary-500 to-secondary-700">
            {insight.type === "podcast" ? (
              <Headphones className="h-16 w-16 text-primary-500" />
            ) : (
              <Video className="h-16 w-16 text-primary-500" />
            )}
          </div>
        )}

        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="w-16 h-16 rounded-full bg-primary-500 flex items-center justify-center hover:bg-primary-600 transition-colors"
          >
            <Play className="h-8 w-8 text-secondary-900 ml-1" fill="currentColor" />
          </button>
        </div>

        {/* Duration badge */}
        <div className="absolute bottom-2 right-2">
          <Badge className="bg-black/70 text-white">
            {formatDuration(insight.duration)}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4 space-y-3">
        <div className="flex items-start gap-2">
          <Badge
            className={
              insight.type === "podcast"
                ? "bg-purple-100 text-purple-700"
                : "bg-blue-100 text-blue-700"
            }
          >
            {insight.type === "podcast" ? (
              <>
                <Headphones className="h-3 w-3 mr-1" />
                Podcast
              </>
            ) : (
              <>
                <Video className="h-3 w-3 mr-1" />
                Vídeo
              </>
            )}
          </Badge>
        </div>

        <div>
          <h3 className="font-semibold text-secondary-900 line-clamp-2 mb-1">
            {insight.title}
          </h3>
          {insight.description && (
            <p className="text-sm text-gray-600 line-clamp-2">{insight.description}</p>
          )}
        </div>

        <p className="text-xs text-gray-500">
          Publicado em{" "}
          {format(new Date(insight.published_at), "dd 'de' MMMM 'de' yyyy", {
            locale: ptBR
          })}
        </p>
      </CardContent>

      {/* Media player (simplified) */}
      {isPlaying && (
        <CardContent className="px-4 pb-4 pt-0">
          {insight.type === "podcast" ? (
            <audio controls className="w-full" src={insight.media_url}>
              Seu navegador não suporta o elemento de áudio.
            </audio>
          ) : (
            <video controls className="w-full rounded" src={insight.media_url}>
              Seu navegador não suporta o elemento de vídeo.
            </video>
          )}
        </CardContent>
      )}
    </Card>
  );
}

interface InsightsEmptyStateProps {
  type?: InsightType;
}

function InsightsEmptyState({type}: InsightsEmptyStateProps) {
  const Icon = type === "podcast" ? Headphones : type === "video" ? Video : Headphones;
  const message = type
    ? `Nenhum ${type === "podcast" ? "podcast" : "vídeo"} disponível no momento`
    : "Nenhum insight disponível no momento";

  return (
    <EmptyState
      icon={Icon}
      title={message}
      description="Nossa equipe está trabalhando em novos conteúdos exclusivos para você"
    />
  );
}
