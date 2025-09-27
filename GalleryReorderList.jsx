import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Edit, Trash2, Play } from 'lucide-react';
import { getVideoThumbnail } from '../gallery/VideoEmbed';

export default function GalleryReorderList({ items, onReorder, onEdit, onDelete }) {
  const getDisplayImage = (item) => {
    if (item.is_external_url && item.media_type === 'video') {
      const thumbnail = getVideoThumbnail(item.media_url);
      return thumbnail?.thumbnail || item.media_url;
    }
    return item.media_url;
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    onReorder(sourceIndex, destinationIndex);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="gallery-items">
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`space-y-3 ${snapshot.isDraggingOver ? 'bg-blue-50' : ''} transition-colors rounded-lg p-2`}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <Card
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={`${snapshot.isDragging ? 'rotate-2 shadow-2xl' : ''} transition-all duration-200`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        {/* Drag Handle */}
                        <div
                          {...provided.dragHandleProps}
                          className="flex-shrink-0 p-2 rounded hover:bg-gray-100 cursor-grab active:cursor-grabbing"
                        >
                          <GripVertical className="w-5 h-5 text-gray-400" />
                        </div>

                        {/* Thumbnail */}
                        <div className="w-16 h-16 flex-shrink-0 relative overflow-hidden rounded-lg">
                          <img
                            src={getDisplayImage(item)}
                            alt={item.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              if (item.is_external_url && item.media_type === 'video') {
                                const thumbnail = getVideoThumbnail(item.media_url);
                                if (thumbnail?.fallback && e.target.src !== thumbnail.fallback) {
                                  e.target.src = thumbnail.fallback;
                                }
                              }
                            }}
                          />
                          {item.media_type === 'video' && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-6 h-6 bg-black/70 rounded-full flex items-center justify-center">
                                <Play className="w-3 h-3 text-white" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-medium text-gray-900 truncate">{item.title}</h3>
                            <div className="flex gap-1">
                              {item.is_featured && (
                                <Badge className="bg-yellow-100 text-yellow-800 text-xs">
                                  Featured
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {item.media_type}
                              </Badge>
                              {item.is_external_url && (
                                <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                  External
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-500">
                              <Badge variant="outline" className="text-xs capitalize mr-2">
                                {item.category?.replace('-', ' ')}
                              </Badge>
                              {item.child_name && (
                                <span>By {item.child_name}, age {item.child_age}</span>
                              )}
                            </div>
                            <div className="text-xs text-gray-400">
                              Position {index + 1}
                            </div>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(item)}
                            className="text-gray-600 hover:text-blue-600"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(item)}
                            className="text-gray-600 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}