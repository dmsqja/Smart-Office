import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    IconButton,
    Stack,
    Divider
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import { BoardAPI } from '../../utils/boardApi';
import CommentList from './CommentList';
import CommentForm from './CommentForm';
import '../../styles/postDetail.css';

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
            await fetchComments();
        } catch (error) {
            console.error('댓글 작성 실패:', error);
            alert('댓글 작성에 실패했습니다.');
        }
    };

    const handleCommentDelete = async (commentId) => {
        if (window.confirm('댓글을 삭제하시겠습니까?')) {
            try {
                await BoardAPI.deleteComment(commentId);
                await fetchComments();
            } catch (error) {
                console.error('댓글 삭제 실패:', error);
                alert('댓글 삭제에 실패했습니다.');
            }
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner" />
            </div>
        );
    }

    return (
        <div className="post-detail-page">
            <div className="post-detail-container">
                {/* 헤더 영역 */}
                <div className="post-header">
                    <Stack
                        direction="row"
                        alignItems="center"
                        spacing={2}
                    >
                        <IconButton
                            onClick={handleBack}
                            className="back-button"
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        <Typography className="post-title" component="h1">
                            {post?.title}
                        </Typography>
                        {userInfo.employeeId === post?.authorEmployeeId && (
                            <Stack direction="row" spacing={1} className="action-buttons">
                                <Button
                                    startIcon={<EditIcon />}
                                    onClick={handleEdit}
                                    variant="contained"
                                    className="edit-button"
                                >
                                    수정
                                </Button>
                                <Button
                                    startIcon={<DeleteIcon />}
                                    onClick={handleDelete}
                                    variant="contained"
                                    className="delete-button"
                                >
                                    삭제
                                </Button>
                            </Stack>
                        )}
                    </Stack>
                </div>

                {/* 게시글 정보 */}
                <Box className="post-info">
                    <Stack
                        direction="row"
                        spacing={3}
                        alignItems="center"
                    >
                        <Typography className="info-text">
                            작성자: {post?.authorEmployeeId}
                        </Typography>
                        <Typography className="info-text">
                            작성일: {new Date(post?.createdAt).toLocaleString('ko-KR')}
                        </Typography>
                    </Stack>
                </Box>

                {/* 게시글 내용 */}
                <div className="post-content">
                    {post?.content}
                </div>

                {/* 댓글 섹션 */}
                <div className="comment-section">
                    <Typography className="comment-header">
                        <ChatBubbleOutlineIcon sx={{ fontSize: '1.2rem' }} />
                        댓글
                        <span className="comment-count">{comments.length}</span>
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
                </div>
            </div>
        </div>
    );
};

export default PostDetail;