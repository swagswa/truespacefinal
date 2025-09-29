import { 
  ThemesResponse, 
  ThemeResponse, 
  SubtopicsResponse, 
  LessonsResponse,
  HealthResponse,
  ApiResponse,
  CreateThemeRequest,
  CreateSubtopicRequest,
  CreateLessonRequest,
  UpdateThemeRequest,
  Theme,
  Subtopic,
  Lesson
} from '@/types/api';

// Mock data for topics and subtopics
const mockThemes: Theme[] = [
  {
    id: 1,
    title: "Математика",
    slug: "mathematics",
    description: "Основы математики и алгебры",
    icon: "📐",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Физика",
    slug: "physics", 
    description: "Основы физики и механики",
    icon: "⚛️",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    title: "Химия",
    slug: "chemistry",
    description: "Основы химии и органических соединений",
    icon: "🧪",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockSubtopics: Subtopic[] = [
  // Mathematics subtopics
  {
    id: 1,
    title: "Алгебра",
    slug: "algebra",
    description: "Основы алгебры и уравнений",
    themeId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Геометрия", 
    slug: "geometry",
    description: "Планиметрия и стереометрия",
    themeId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Physics subtopics
  {
    id: 3,
    title: "Механика",
    slug: "mechanics", 
    description: "Кинематика и динамика",
    themeId: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    title: "Термодинамика",
    slug: "thermodynamics",
    description: "Тепловые процессы и энергия",
    themeId: 2,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // Chemistry subtopics
  {
    id: 5,
    title: "Органическая химия",
    slug: "organic-chemistry",
    description: "Углеводороды и их производные",
    themeId: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    title: "Неорганическая химия", 
    slug: "inorganic-chemistry",
    description: "Металлы, неметаллы и их соединения",
    themeId: 3,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockLessons: Lesson[] = [
  {
    id: 1,
    title: "Введение в алгебру",
    slug: "intro-to-algebra",
    description: "Основные понятия алгебры",
    content: "Алгебра - это раздел математики...",
    duration: 30,
    subtopicId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    title: "Линейные уравнения",
    slug: "linear-equations",
    description: "Решение линейных уравнений",
    content: "Линейное уравнение имеет вид ax + b = 0...",
    duration: 45,
    subtopicId: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = '') {
    this.baseUrl = baseUrl;
  }

  // Simulate API delay
  private async delay(ms: number = 500): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Generic GET method for API calls
  async get<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  // Health Check
  async healthCheck(): Promise<HealthResponse> {
    await this.delay(200);
    return {
      data: {
        status: 'healthy',
        timestamp: new Date().toISOString()
      },
      success: true,
      message: 'Health check successful'
    };
  }

  // Themes
  async getThemes(params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ThemesResponse> {
    try {
      console.log('🌐 ApiClient: Making request to /api/themes');
      const response = await this.get<{
        themes: Theme[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>('/api/themes');
      
      console.log('🌐 ApiClient: Received response:', response);
      return {
        themes: response.themes,
        pagination: response.pagination
      };
    } catch (error) {
      console.error('🌐 ApiClient: Error fetching themes:', error);
      // Fallback to mock data if API fails
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const themes = mockThemes.slice(startIndex, endIndex);
      
      return {
        themes,
        pagination: {
          page,
          limit,
          total: mockThemes.length,
          totalPages: Math.ceil(mockThemes.length / limit)
        }
      };
    }
  }

  async getTheme(slug: string): Promise<ThemeResponse> {
    await this.delay();
    const theme = mockThemes.find(t => t.slug === slug);
    if (!theme) {
      throw new Error(`Theme with slug "${slug}" not found`);
    }
    

    
    return {
      data: theme,
      success: true,
      message: 'Theme retrieved successfully'
    };
  }

  async createTheme(data: CreateThemeRequest): Promise<ThemeResponse> {
    await this.delay();
    const newTheme: Theme = {
      id: mockThemes.length + 1,
      title: data.title,
      slug: data.slug,
      description: data.description,
      icon: data.icon || '📚', // Use provided icon or default
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockThemes.push(newTheme);
    
    return {
      data: newTheme,
      success: true,
      message: 'Theme created successfully'
    };
  }

  async updateTheme(slug: string, data: UpdateThemeRequest): Promise<ThemeResponse> {
    await this.delay();
    const themeIndex = mockThemes.findIndex(t => t.slug === slug);
    if (themeIndex === -1) {
      throw new Error(`Theme with slug "${slug}" not found`);
    }
    
    mockThemes[themeIndex] = {
      ...mockThemes[themeIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    return this.getTheme(slug);
  }

  async deleteTheme(slug: string): Promise<{ deletedTheme: ThemeResponse }> {
    await this.delay();
    const themeIndex = mockThemes.findIndex(t => t.slug === slug);
    if (themeIndex === -1) {
      throw new Error(`Theme with slug "${slug}" not found`);
    }
    
    const deletedTheme = await this.getTheme(slug);
    mockThemes.splice(themeIndex, 1);
    
    return { deletedTheme };
  }

  // Subtopics
  async getSubtopics(themeSlug: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<SubtopicsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
    if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);
    
    const url = `/api/themes/${themeSlug}/subtopics${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      if (response.status === 404) {
        throw new Error(`Theme with slug "${themeSlug}" not found`);
      }
      throw new Error(`Failed to fetch subtopics: ${response.statusText}`);
    }
    
    return await response.json();
  }

  async createSubtopic(themeSlug: string, data: CreateSubtopicRequest): Promise<Subtopic> {
    await this.delay();
    const theme = mockThemes.find(t => t.slug === themeSlug);
    if (!theme) {
      throw new Error(`Theme with slug "${themeSlug}" not found`);
    }
    
    const newSubtopic: Subtopic = {
      id: mockSubtopics.length + 1,
      title: data.title,
      slug: data.slug,
      description: data.description,
      themeId: theme.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockSubtopics.push(newSubtopic);
    return newSubtopic;
  }

  // Lessons
  async getLessons(subtopicId: number, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<LessonsResponse> {
    await this.delay();
    
    const subtopic = mockSubtopics.find(s => s.id === subtopicId);
    if (!subtopic) {
      throw new Error(`Subtopic with id "${subtopicId}" not found`);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const allLessons = mockLessons.filter(l => l.subtopicId === subtopicId);
    const lessons = allLessons.slice(startIndex, endIndex);
    
    return {
      lessons,
      subtopic,
      pagination: {
        page,
        limit,
        total: allLessons.length,
        totalPages: Math.ceil(allLessons.length / limit)
      }
    };
  }

  async getLessonsBySlug(subtopicSlug: string, params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<LessonsResponse> {
    try {
      const response = await fetch(`/api/subtopics/${subtopicSlug}/lessons`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch lessons: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Преобразуем данные в формат, ожидаемый LessonCard
      const transformedLessons = data.lessons.map((lesson: Lesson) => ({
        ...lesson,
        duration: `${lesson.duration || 30} мин`, // Преобразуем число в строку с единицами
        subtopic: data.subtopic?.title || subtopicSlug, // Добавляем название подтемы
        videoUrl: (lesson as Lesson & { videoUrl?: string }).videoUrl || undefined // Добавляем опциональное поле videoUrl
      }));
      
      const page = params?.page || 1;
      const limit = params?.limit || 10;
      const total = data.lessons.length;
      
      return {
        lessons: transformedLessons,
        subtopic: data.subtopic,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('Error fetching lessons by slug:', error);
      throw error;
    }
  }

  async createLesson(subtopicId: number, data: CreateLessonRequest): Promise<ApiResponse<Lesson>> {
    await this.delay();
    const subtopic = mockSubtopics.find(s => s.id === subtopicId);
    if (!subtopic) {
      throw new Error(`Subtopic with id "${subtopicId}" not found`);
    }
    
    const newLesson: Lesson = {
      id: mockLessons.length + 1,
      title: data.title,
      slug: data.slug,
      description: data.description,
      content: data.content,
      duration: 30, // Default duration in minutes
      subtopicId: subtopicId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockLessons.push(newLesson);
    return { 
      data: newLesson,
      success: true,
      message: 'Lesson created successfully'
    };
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

export default ApiClient;