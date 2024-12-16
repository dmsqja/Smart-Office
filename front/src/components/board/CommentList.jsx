// components/board/CommentList.jsx
import React from 'react';
import {
    List,
    ListItem,
    ListItemText,
    Typography,
    IconButton,
    Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const CommentList = ({ comments, onCommentDelete }) => {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

    return (
        <List>
            {comments.map((comment) => (
                <ListItem
                    key={comment.id}
                    alignItems="flex-start"
                    secondaryAction={
                        userInfo.employeeId === comment.authorEmployeeId && (
                            <IconButton
                                edge="end"
                                color="error"
                                onClick={() => onCommentDelete(comment.id)}
                            >
                                <DeleteIcon />
                            </IconButton>
                        )
                    }
                >
                    <ListItemText
                        primary={
                            <Stack direction="row" spacing={2} alignItems="center">
                                <Typography component="span" variant="subtitle2">
                                    {comment.authorEmployeeId}
                                </Typography>
                                <Typography component="span" variant="caption" color="text.secondary">
                                    {new Date(comment.createdAt).toLocaleString('ko-KR')}
                                </Typography>
                            </Stack>
                        }
                        secondary={comment.content}
                    />
                </ListItem>
            ))}
        </List>
    );
};

export default CommentList;