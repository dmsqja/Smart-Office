// components/board/PostForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    Box,
    Paper,
    TextField,
    Button,
    Stack,
    Typography,
    IconButton,
    List,
    ListItem,
    ListItemText,
    ListItemIcon
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { BoardAPI } from '../../utils/boardApi';

const PostForm = () => {
    const navigate = useNavigate();
    const { boardId, postId } = useParams();  // postId 추가
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        boardId: boardId
    });
    const [files, setFiles] = useState([]);
    const [existingFiles, setExistingFiles] = useState([]); // 수정 시 기존 첨부파일

    useEffect(() => {
        const fetchPost = async () => {
            if (!postId) return;

            try {
                const [postResponse, filesResponse] = await Promise.all([
                    BoardAPI.getPostDetail(postId),
                    BoardAPI.getPostAttachments(postId)
                ]);

                const { title, content } = postResponse.data;
                setFormData(prev => ({
                    ...prev,
                    title,
                    content
                }));
                setExistingFiles(filesResponse.data);
            } catch (error) {
                console.error('데이터 로드 실패:', error);
                alert('데이터를 불러오는데 실패했습니다.');
                navigate(`/boards/${boardId}`);
            }
        };

        fetchPost();
    }, [postId, boardId, navigate]);
    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        setFiles(prev => [...prev, ...selectedFiles]);
    };

    const handleFileDelete = (indexToDelete) => {
        setFiles(prev => prev.filter((_, index) => index !== indexToDelete));
    };

    const handleExistingFileDelete = async (fileId) => {
        try {
            await BoardAPI.deletePostAttachment(postId, fileId);
            setExistingFiles(prev => prev.filter(file => file.id !== fileId));
        } catch (error) {
            console.error('파일 삭제 실패:', error);
            alert('파일 삭제에 실패했습니다.');
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formDataWithFiles = new FormData();
        formDataWithFiles.append('title', formData.title);
        formDataWithFiles.append('content', formData.content);
        formDataWithFiles.append('boardId', boardId);

        files.forEach(file => {
            formDataWithFiles.append('attachments', file);
        });

        try {
            if (postId) {
                await BoardAPI.updatePost(postId, formDataWithFiles);
            } else {
                await BoardAPI.createPost(formData, files);
            }

            navigate(`/boards/${boardId}`);
        } catch (error) {
            console.error('게시글 저장 실패:', error);
            alert('게시글 저장에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleBack = () => {
        navigate(`/boards/${boardId}`);
    };

    return (
        <Box className="container">
            <Paper elevation={3} sx={{ p: 3 }}>
                <form onSubmit={handleSubmit}>
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
                            {postId ? '게시글 수정' : '새 게시글 작성'}
                        </Typography>
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={<SaveIcon />}
                            disabled={loading}
                        >
                            {postId ? '수정' : '저장'}
                        </Button>
                    </Stack>

                    <Stack spacing={3}>
                        <TextField
                            name="title"
                            label="제목"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            fullWidth
                        />
                        <TextField
                            name="content"
                            label="내용"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            fullWidth
                            multiline
                            rows={15}
                        />
                    </Stack>
                    {/* 파일 첨부 섹션 */}
                    <Box sx={{ mt: 3 }}>
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                            id="file-input"
                        />
                        <label htmlFor="file-input">
                            <Button
                                variant="outlined"
                                component="span"
                                startIcon={<AttachFileIcon />}
                            >
                                파일 첨부
                            </Button>
                        </label>

                        {/* 기존 첨부 파일 목록 */}
                        {existingFiles.length > 0 && (
                            <List>
                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                                    기존 첨부 파일
                                </Typography>
                                {existingFiles.map((file) => (
                                    <ListItem
                                        key={file.id}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleExistingFileDelete(file.id)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemIcon>
                                            <InsertDriveFileIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={file.originalFileName}
                                            secondary={`${(file.fileSize / 1024 / 1024).toFixed(2)} MB`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}

                        {/* 새로 첨부한 파일 목록 */}
                        {files.length > 0 && (
                            <List>
                                <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                                    새로 첨부한 파일
                                </Typography>
                                {files.map((file, index) => (
                                    <ListItem
                                        key={index}
                                        secondaryAction={
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleFileDelete(index)}
                                            >
                                                <DeleteIcon />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemIcon>
                                            <InsertDriveFileIcon />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={file.name}
                                            secondary={`${(file.size / 1024 / 1024).toFixed(2)} MB`}
                                        />
                                    </ListItem>
                                ))}
                            </List>
                        )}
                    </Box>
                </form>
            </Paper>
        </Box>
    );
};

export default PostForm;