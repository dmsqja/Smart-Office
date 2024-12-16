// components/board/PostDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Paper,
    Divider,
    Button,
    IconButton,
    Stack
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { BoardAPI } from '../../utils/boardApi';
import CommentList from './CommentList';
import CommentForm from './CommentForm';

const PostDetail = () => {
    const { boardId, postId } = useParams();
    const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

    const fetchPost = async () => {
        try {
            const response = await BoardAPI.getPostDetail(postId);
            setPost(response.data);
        } catch (error) {
            console.error('게시글을 불러오는데 실패했습니다:', error);
        }
    };

    const handleEdit = () => {
        navigate(`/boards/${boardId}/posts/${postId}/edit`);
    };

    const handleDelete = async () => {
        if (window.confirm('정말 삭제하시겠습니까?')) {
            try {
                await BoardAPI.deletePost(postId);
                navigate(`/boards/${boardId}`);
            } catch (error) {
                console.error('게시글 삭제 실패:', error);
            }
        }
    };

    const handleBack = () => {
        navigate(`/boards/${boardId}`);
    };

    const fetchComments = async () => {
        try {
            const response = await BoardAPI.getComments(postId);
            setComments(response.data);
        } catch (error) {
            console.error('댓글을 불러오는데 실패했습니다:', error);
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            await Promise.all([fetchPost(), fetchComments()]);
            setLoading(false);
        };
        fetchData();
    }, [postId]);

    const handleCommentSubmit = async (commentData) => {
        try {
            await BoardAPI.createComment(commentData);
            await fetchComments();  // 댓글 목록 새로고침
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            alert('댓글 작성에 실패했습니다.');
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (window.confirm('댓글을 삭제하시겠습니까?')) {
            try {
                await BoardAPI.deleteComment(commentId);
                await fetchComments();  // 댓글 목록 새로고침
            } catch (error) {
                console.error('댓글 삭제 실패:', error);
                alert('댓글 삭제에 실패했습니다.');
            }
        }
    };
    if (loading) {
        return <Box>Loading...</Box>;
    }

    return (
        <Box className="container">
            <Paper elevation={3} sx={{ p: 3 }}>
                {/* 헤더 영역 */}
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    <IconButton onClick={handleBack}>
                        <ArrowBackIcon />
                    </IconButton>
                    <Typography variant="h5" component="h1" sx={{ flexGrow: 1 }}>
                        {post?.title}
                    </Typography>
                    {userInfo.employeeId === post?.authorEmployeeId && (
                        <Stack direction="row" spacing={1}>
                            <Button
                                startIcon={<EditIcon />}
                                onClick={handleEdit}
                                variant="outlined"
                            >
                                수정
                            </Button>
                            <Button
                                startIcon={<DeleteIcon />}
                                onClick={handleDelete}
                                variant="outlined"
                                color="error"
                            >
                                삭제
                            </Button>
                        </Stack>
                    )}
                </Stack>

                {/* 게시글 정보 */}
                <Box sx={{ mb: 2 }}>
                    <Stack
                        direction="row"
                        spacing={2}
                        sx={{ color: 'text.secondary', mb: 1 }}
                    >
                        <Typography>작성자: {post?.authorEmployeeId}</Typography>
                        <Typography>
                            작성일: {new Date(post?.createdAt).toLocaleString('ko-KR')}
                        </Typography>
                    </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* 게시글 내용 */}
                <Box sx={{ minHeight: '200px', whiteSpace: 'pre-wrap' }}>
                    {post?.content}
                </Box>

                {/* 댓글 섹션 추가 */}
                <Divider sx={{ my: 3 }} />

                <Typography variant="h6" sx={{ mb: 2 }}>
                    댓글 {comments.length}개
                </Typography>

                <CommentList
                    comments={comments}
                    onCommentDelete={handleCommentDelete}
                />

                <Box sx={{ mt: 2 }}>
                    <CommentForm
                        postId={postId}
                        onCommentSubmit={handleCommentSubmit}
                    />
                </Box>
            </Paper>
        </Box>
    );
};

export default PostDetail;