// components/board/CommentForm.jsx
import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Stack
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const CommentForm = ({ postId, onCommentSubmit }) => {
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim()) return;

        setLoading(true);
        try {
            await onCommentSubmit({
                postId,
                content: content.trim()
            });
            setContent('');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            <Stack direction="row" spacing={2}>
                <TextField
                    fullWidth
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="댓글을 입력하세요"
                    size="small"
                    disabled={loading}
                />
                <Button
                    type="submit"
                    variant="contained"
                    endIcon={<SendIcon />}
                    disabled={loading || !content.trim()}
                >
                    등록
                </Button>
            </Stack>
        </Box>
    );
};

export default CommentForm;