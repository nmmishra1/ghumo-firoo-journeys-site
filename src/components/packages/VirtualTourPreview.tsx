import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  RotateCcw, 
  Camera, 
  MapPin, 
  Clock, 
  Eye, 
  Headphones,
  Smartphone,
  Monitor,
  X
} from 'lucide-react';

interface TourStop {
  id: string;
  title: string;
  description: string;
  image: string;
  panoramaUrl?: string;
  videoUrl?: string;
  audioDescription?: string;
  duration: string;
  highlights: string[];
  coordinates?: { lat: number; lng: number };
  bestTime?: string;
  tips?: string[] | string;
}

interface VirtualTourPreviewProps {
  destination: string;
  tourStops: TourStop[];
  packageTitle: string;
  onBookTour?: () => void;
  onRequestFullTour?: () => void;
  className?: string;
}

const getYoutubeEmbedUrl = (url: string, isMuted: boolean) => {
  if (!url) return '';
  let videoId = '';
  try {
    const cleanedUrl = url.trim();
    if (cleanedUrl.includes('youtube.com/shorts/') || cleanedUrl.includes('youtube.com/shorts/')) {
      videoId = cleanedUrl.split('shorts/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanedUrl.includes('youtube.com/watch')) {
      const urlObj = new URL(cleanedUrl.startsWith('http') ? cleanedUrl : `https://${cleanedUrl}`);
      videoId = urlObj.searchParams.get('v') || '';
    } else if (cleanedUrl.includes('youtu.be/')) {
      videoId = cleanedUrl.split('youtu.be/')[1]?.split('?')[0]?.split('&')[0];
    } else if (cleanedUrl.includes('youtube.com/embed/')) {
      videoId = cleanedUrl.split('embed/')[1]?.split('?')[0]?.split('&')[0];
    } else {
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = cleanedUrl.match(regExp);
      if (match && match[2] && match[2].length === 11) {
        videoId = match[2];
      }
    }
  } catch (e) {
    console.error("Error parsing YouTube URL", e);
  }
  
  videoId = videoId ? videoId.trim() : '';
  const origin = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&playlist=${videoId}&loop=1&enablejsapi=1&origin=${origin}` : url;
};

const VirtualTourPreview: React.FC<VirtualTourPreviewProps> = ({
  destination,
  tourStops,
  packageTitle,
  onBookTour,
  onRequestFullTour
}) => {
  if (!tourStops || tourStops.length === 0) {
    return (
      <div className="p-6">
        <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Play className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Virtual tour preview is not available for this package yet.</p>
            <p className="text-sm text-gray-500 mt-2">Our team is working to bring an immersive preview soon.</p>
          </div>
        </div>
      </div>
    );
  }
  const [currentStop, setCurrentStop] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewMode, setViewMode] = useState<'preview' | 'immersive'>('preview');
  const [showControls, setShowControls] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressInterval = useRef<NodeJS.Timeout | null>(null);

  const currentTourStop = tourStops[currentStop];

  useEffect(() => {
    if (isPlaying && !progressInterval.current) {
      progressInterval.current = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 1;
        });
      }, 100);
    } else if (!isPlaying && progressInterval.current) {
      clearInterval(progressInterval.current);
      progressInterval.current = null;
    }

    return () => {
      if (progressInterval.current) {
        clearInterval(progressInterval.current);
      }
    };
  }, [isPlaying]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play();
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleNext = () => {
    if (currentStop < tourStops.length - 1) {
      setCurrentStop(prev => prev + 1);
      setProgress(0);
    } else {
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handlePrevious = () => {
    if (currentStop > 0) {
      setCurrentStop(prev => prev - 1);
      setProgress(0);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      if (containerRef.current?.requestFullscreen) {
        containerRef.current.requestFullscreen();
        setIsFullscreen(true);
        setViewMode('immersive');
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
        setViewMode('preview');
      }
    }
  };

  const handleStopSelect = (index: number) => {
    setCurrentStop(index);
    setProgress(0);
  };

  const renderPreviewMode = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold mb-3">
          <Eye className="w-4 h-4" />
          Virtual Tour Preview
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Explore {destination} Virtually
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Take a virtual journey through the highlights of your {packageTitle} before you book
        </p>
      </div>

      {/* Main Tour Display */}
      <Card className="overflow-hidden shadow-xl">
        <div className="relative">
          {/* Tour Image/Video */}
          <div className="relative h-96 bg-gray-900">
            {currentTourStop.videoUrl ? (
              currentTourStop.videoUrl.includes('youtube.com') || currentTourStop.videoUrl.includes('youtu.be') ? (
                <iframe
                  className="w-full h-full"
                  src={getYoutubeEmbedUrl(currentTourStop.videoUrl, isMuted)}
                  title={currentTourStop.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  poster={currentTourStop.image}
                  muted={isMuted}
                  onEnded={handleNext}
                >
                  <source src={currentTourStop.videoUrl} type="video/mp4" />
                </video>
              )
            ) : (
              <img 
                src={currentTourStop.image} 
                alt={currentTourStop.title}
                className="w-full h-full object-cover"
              />
            )}
            
            {/* Overlay Controls */}
            {!(currentTourStop.videoUrl?.includes('youtube.com') || currentTourStop.videoUrl?.includes('youtu.be')) && (
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-4">
                  <Button
                    size="lg"
                    className="bg-white/90 text-gray-800 hover:bg-white rounded-full w-16 h-16"
                    onClick={isPlaying ? handlePause : handlePlay}
                  >
                    {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                  </Button>
                </div>
              </div>
            )}

            {/* Progress Bar */}
            {isPlaying && (
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
                <div 
                  className="h-full bg-accent transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
            )}

            {/* Tour Stop Info */}
            <div className="absolute top-4 left-4 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="w-4 h-4" />
                <span>{currentStop + 1} of {tourStops.length}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-black/70 text-white border-white/30 hover:bg-black/80"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-black/70 text-white border-white/30 hover:bg-black/80"
                onClick={toggleFullscreen}
              >
                <Maximize className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Tour Stop Details */}
          <CardContent className="p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  {currentTourStop.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {currentTourStop.description}
                </p>
                
                {/* Highlights */}
                <div className="space-y-2">
                  <h4 className="font-semibold text-gray-700">Highlights:</h4>
                  <div className="space-y-1">
                    {currentTourStop.highlights.map((highlight, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-accent rounded-full" />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {/* Tour Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <Clock className="w-4 h-4" />
                      <span>Duration</span>
                    </div>
                    <p className="font-semibold">{currentTourStop.duration}</p>
                  </div>
                  {currentTourStop.bestTime && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <Camera className="w-4 h-4" />
                        <span>Best Time</span>
                      </div>
                      <p className="font-semibold">{currentTourStop.bestTime}</p>
                    </div>
                  )}
                </div>

                {/* Tips */}
                {(() => {
                  const tipsArray = Array.isArray(currentTourStop.tips)
                    ? currentTourStop.tips
                    : currentTourStop.tips
                      ? [currentTourStop.tips]
                      : [];
                  return tipsArray.length > 0 ? (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Pro Tips:</h4>
                      <div className="space-y-1">
                        {tipsArray.map((tip, index) => (
                          <div key={index} className="text-sm text-gray-600 bg-blue-50 p-2 rounded">
                            💡 {tip}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>
            </div>
          </CardContent>
        </div>
      </Card>

      {/* Tour Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStop === 0}
          className="flex items-center gap-2"
        >
          <RotateCcw className="w-4 h-4" />
          Previous Stop
        </Button>
        
        <div className="flex items-center gap-2">
          {tourStops.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentStop 
                  ? 'bg-accent' 
                  : index < currentStop 
                    ? 'bg-orange-300' 
                    : 'bg-gray-300'
              }`}
              onClick={() => handleStopSelect(index)}
            />
          ))}
        </div>
        
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={currentStop === tourStops.length - 1}
          className="flex items-center gap-2"
        >
          Next Stop
          <Play className="w-4 h-4" />
        </Button>
      </div>

      {/* Tour Stops Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tourStops.map((stop, index) => (
          <Card 
            key={stop.id} 
            className={`cursor-pointer transition-all hover:shadow-lg ${
              index === currentStop ? 'ring-2 ring-accent' : ''
            }`}
            onClick={() => handleStopSelect(index)}
          >
            <div className="relative">
              <img 
                src={stop.image} 
                alt={stop.title}
                className="w-full h-32 object-cover rounded-t-lg"
                onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src = '/placeholder.svg'; }}
              />
              {index === currentStop && (
                <div className="absolute inset-0 bg-accent/20 flex items-center justify-center rounded-t-lg">
                  <div className="bg-accent text-white p-2 rounded-full">
                    <Eye className="w-4 h-4" />
                  </div>
                </div>
              )}
            </div>
            <CardContent className="p-3">
              <h4 className="font-semibold text-sm mb-1">{stop.title}</h4>
              <p className="text-xs text-gray-600 line-clamp-2">{stop.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-xs">
                  {stop.duration}
                </Badge>
                {stop.videoUrl && (
                  <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                    Video
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button 
          size="lg"
          className="bg-gradient-to-r bg-gradient-warm text-white hover:opacity-90 text-white font-bold px-8"
          onClick={onBookTour}
        >
          Book This Package Now
        </Button>
        <Button 
          size="lg"
          variant="outline"
          className="border-accent/40 text-accent hover:bg-accent/10 px-8"
          onClick={onRequestFullTour}
        >
          Request Full Virtual Tour
        </Button>
      </div>

      {/* Device Compatibility */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3 text-center">Experience on Any Device</h3>
        <div className="flex justify-center gap-8">
          <div className="text-center">
            <Monitor className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Desktop</p>
          </div>
          <div className="text-center">
            <Smartphone className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Mobile</p>
          </div>
          <div className="text-center">
            <Headphones className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">VR Ready</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderImmersiveMode = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Immersive Header */}
      <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur-sm">
        <div className="text-white">
          <h2 className="text-xl font-bold">{currentTourStop.title}</h2>
          <p className="text-sm opacity-75">{currentStop + 1} of {tourStops.length} stops</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/10 text-white border-white/30"
          onClick={() => setViewMode('preview')}
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Immersive Content */}
      <div className="flex-1 relative">
        {currentTourStop.videoUrl ? (
          currentTourStop.videoUrl.includes('youtube.com') || currentTourStop.videoUrl.includes('youtu.be') ? (
            <iframe
              className="w-full h-full"
              src={getYoutubeEmbedUrl(currentTourStop.videoUrl, isMuted)}
              title={currentTourStop.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              poster={currentTourStop.image}
              muted={isMuted}
              autoPlay
              onEnded={handleNext}
            >
              <source src={currentTourStop.videoUrl} type="video/mp4" />
            </video>
          )
        ) : (
          <img 
            src={currentTourStop.image} 
            alt={currentTourStop.title}
            className="w-full h-full object-cover"
          />
        )}
        
        {/* Immersive Controls */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 backdrop-blur-sm rounded-full px-6 py-3">
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handlePrevious}
            disabled={currentStop === 0}
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={isPlaying ? handlePause : handlePlay}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={handleNext}
            disabled={currentStop === tourStops.length - 1}
          >
            <Play className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="ghost"
            className="text-white hover:bg-white/20"
            onClick={toggleMute}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={containerRef} className="w-full">
      {viewMode === 'preview' ? renderPreviewMode() : renderImmersiveMode()}
    </div>
  );
};

export default VirtualTourPreview;