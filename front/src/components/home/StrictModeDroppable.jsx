import { useState, useEffect } from 'react';
import { Droppable } from '@hello-pangea/dnd';

const StrictModeDroppable = ({ children, droppableId }) => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        setEnabled(true);
        return () => setEnabled(false);
    }, []);

    if (!enabled) {
        return null;
    }

    return (
        <Droppable droppableId={droppableId}>
            {(provided) => (
                <div 
                    {...provided.droppableProps} 
                    ref={provided.innerRef} 
                    className="widgets-list"
                >
                    {children}
                    {provided.placeholder}
                </div>
            )}
        </Droppable>
    );
};

export default StrictModeDroppable;