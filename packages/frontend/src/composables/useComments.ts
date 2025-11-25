import { ref } from 'vue';
import axios from 'axios';

interface Comment {
  id: number;
  content: string;
  author: {
    id: number;
    username: string;
    avatarUrl?: string;
  };
  createdAt: string;
}

export function useComments(projectId: number) {
  const comments = ref<Comment[]>([]);

  const fetchComments = async () => {
    const response = await axios.get(`/api/projects/${projectId}/comments`);
    comments.value = response.data;
  };

  const addComment = async (content: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.post(`/api/projects/${projectId}/comments`, { content }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    comments.value.push(response.data);
  };

  const updateComment = async (commentId: number, content: string) => {
    const token = localStorage.getItem('token');
    const response = await axios.put(`/api/projects/${projectId}/comments/${commentId}`, { content }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const index = comments.value.findIndex(c => c.id === commentId);
    if (index !== -1) {
      comments.value.splice(index, 1, response.data);
    }
  };

  const deleteComment = async (commentId: number) => {
    const token = localStorage.getItem('token');
    await axios.delete(`/api/projects/${projectId}/comments/${commentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const index = comments.value.findIndex(c => c.id === commentId);
    if (index !== -1) {
      comments.value.splice(index, 1);
    }
  };

  return {
    comments,
    fetchComments,
    addComment,
    updateComment,
    deleteComment,
  };
}
