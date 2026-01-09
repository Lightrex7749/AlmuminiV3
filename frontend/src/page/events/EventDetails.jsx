import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Users, Video, ExternalLink, Share2, ArrowLeft, Edit } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import RSVPButton from '@/components/events/RSVPButton';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { eventService } from '@/services';
import { toast } from 'sonner';
import { format } from 'date-fns';

const EventDetails = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadEvent();
    loadAttendees();
  }, [eventId]);

  const loadEvent = async () => {
    setLoading(true);
    try {
      const response = await eventService.getEventById(eventId);
      
      if (response.success) {
        setEvent(response.data);
      } else {
        console.error('Failed to load event:', response.message);
        toast.error('Unable to load event. Please try again later.');
        navigate('/events');
      }
    } catch (error) {
      console.error('Error loading event:', error);
      toast.error('An error occurred while loading the event.');
      navigate('/events');
    } finally {
      setLoading(false);
    }
  };

  const loadAttendees = async () => {
    try {
      const response = await eventService.getEventAttendees(eventId);
      if (response.success) {
        setAttendees(response.data.slice(0, 10)); // Show first 10
      } else {
        console.error('Failed to load attendees:', response.message);
      }
    } catch (error) {
      console.error('Error loading attendees:', error);
    }
  };

  const handleRSVPChange = () => {
    loadEvent();
    loadAttendees();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event.title,
        text: event.description,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'EEEE, MMMM dd, yyyy • h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  const getEventTypeBadgeColor = (type) => {
    const colors = {
      'workshop': 'bg-purple-100 text-purple-700',
      'webinar': 'bg-blue-100 text-blue-700',
      'conference': 'bg-red-100 text-red-700',
      'networking': 'bg-green-100 text-green-700',
      'meetup': 'bg-yellow-100 text-yellow-700'
    };
    return colors[type] || 'bg-gray-100 text-gray-700';
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isEventCreator = event && currentUser.id === event.created_by;
  const canEdit = isEventCreator || currentUser.role === 'admin';

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="animate-pulse space-y-6">
            <div className="h-96 bg-muted rounded-xl" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-4 bg-muted rounded w-1/2" />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!event) return null;

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl" data-testid="event-details-page">
        {/* Back Button */}
        <Button
          variant="ghost"
          className="mb-6 text-muted-foreground hover:text-foreground hover:bg-muted"
          onClick={() => navigate('/events')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        {/* Event Banner */}
        {event.banner_image && (
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg border border-border">
            <img
              src={event.banner_image}
              alt={event.title}
              className="w-full h-96 object-cover"
            />
          </div>
        )}

        {/* Event Header */}
        <div className="mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge className={`${getEventTypeBadgeColor(event.event_type)} border-none px-3 py-1`}>
                  {event.event_type}
                </Badge>
                {event.is_virtual && (
                  <Badge variant="outline" className="flex items-center gap-1.5 border-border text-muted-foreground px-3 py-1">
                    <Video className="h-3.5 w-3.5" />
                    Virtual
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl font-bold text-foreground leading-tight">{event.title}</h1>
            </div>
            
            <div className="flex gap-2">
              {canEdit && (
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => navigate(`/events/${event.id}/edit`)}
                  data-testid="edit-event-button"
                  className="border-border text-muted-foreground hover:text-foreground"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <Button variant="outline" size="icon" onClick={handleShare} className="border-border text-muted-foreground hover:text-foreground">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Quick Info */}
          <Card className="bg-card border-border shadow-md overflow-hidden">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Date & Time</p>
                    <p className="text-sm text-muted-foreground">{formatDate(event.start_date)}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-[#7091E6]/10 rounded-lg">
                    {event.is_virtual ? (
                      <Video className="h-5 w-5 text-[#7091E6]" />
                    ) : (
                      <MapPin className="h-5 w-5 text-[#7091E6]" />
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Location</p>
                    <p className="text-sm text-muted-foreground">
                      {event.is_virtual ? 'Virtual Event' : event.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-600/10 rounded-lg">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-bold text-sm text-foreground">Attendees</p>
                    <p className="text-sm text-muted-foreground">
                      {event.current_attendees_count || 0} / {event.max_attendees || 'Unlimited'} registered
                    </p>
                  </div>
                </div>

                {event.is_virtual && event.meeting_link && (
                  <div className="flex items-start gap-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <ExternalLink className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-foreground">Meeting Link</p>
                      <a 
                        href={event.meeting_link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline font-medium"
                      >
                        Join Event
                      </a>
                    </div>
                  </div>
                )}
              </div>

              <Separator className="my-6 bg-border" />

              <div className="flex items-center justify-between">
                <div>
                  {event.max_attendees ? (
                    (event.current_attendees_count || 0) >= event.max_attendees ? (
                      <p className="text-sm text-destructive font-bold">Event is full</p>
                    ) : (
                      <p className="text-sm text-green-600 font-medium">
                        {event.max_attendees - (event.current_attendees_count || 0)} spots remaining
                      </p>
                    )
                  ) : (
                    <p className="text-sm text-primary font-medium">Unlimited spots available</p>
                  )}
                </div>
                <RSVPButton eventId={event.id} onRSVPChange={handleRSVPChange} />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Event Description */}
        <Card className="mb-8 bg-card border-border shadow-sm">
          <CardContent className="p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">About This Event</h2>
            <div className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
              {event.description}
            </div>
          </CardContent>
        </Card>

        {/* Attendees */}
        {attendees.length > 0 && (
          <Card className="bg-card border-border shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-foreground">Attendees ({event.current_attendees_count})</h2>
                {event.current_attendees_count > 10 && (
                  <Button 
                    variant="link" 
                    onClick={() => navigate(`/events/${event.id}/attendees`)}
                    className="text-primary hover:no-underline font-bold"
                  >
                    View All
                  </Button>
                )}
              </div>
              <div className="flex flex-wrap gap-6">
                {attendees.map((attendee) => {
                  const profile = attendee.profile;
                  const name = profile?.name || attendee.user?.email || 'Anonymous';
                  const photo = profile?.photo_url;
                  
                  return (
                    <div 
                      key={attendee.id} 
                      className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-xl transition-colors"
                      onClick={() => navigate(`/profile/${attendee.user_id}`)}
                    >
                      <Avatar className="h-12 w-12 border-2 border-border">
                        <AvatarImage src={photo} alt={name} />
                        <AvatarFallback className="bg-primary/10 text-primary">{getInitials(name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-bold text-foreground">{name}</p>
                        {profile?.current_role && (
                          <p className="text-xs text-muted-foreground">{profile.current_role}</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
};

export default EventDetails;
