'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { 
  BookOpen, 
  Target, 
  Clock, 
  CheckCircle, 
  PlayCircle,
  Star,
  TrendingUp,
  Brain,
  Lightbulb,
  ArrowRight,
  Calendar,
  Award
} from 'lucide-react';
import { DnaPageHeader } from '../dna-profile/dna-page-header';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  progress: number;
  modules: LearningModule[];
  skills: string[];
  prerequisites: string[];
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'exercise' | 'quiz';
  duration: string;
  completed: boolean;
  resources: string[];
}

function AILearningPathPage() {
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [topic, setTopic] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [timeCommitment, setTimeCommitment] = useState('1-2 hours/week');

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    setLoading(true);
    try {
      // Mock data for demonstration
      const mockPaths: LearningPath[] = [
        {
          id: '1',
          title: 'Web Development Fundamentals',
          description: 'Master the basics of HTML, CSS, and JavaScript',
          difficulty: 'Beginner',
          estimatedTime: '8 weeks',
          progress: 65,
          skills: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
          prerequisites: ['Basic computer skills'],
          modules: [
            {
              id: '1',
              title: 'HTML Basics',
              description: 'Learn the structure of web pages',
              type: 'video',
              duration: '2 hours',
              completed: true,
              resources: ['MDN HTML Guide', 'W3Schools HTML Tutorial']
            },
            {
              id: '2',
              title: 'CSS Styling',
              description: 'Style your web pages with CSS',
              type: 'video',
              duration: '3 hours',
              completed: true,
              resources: ['CSS Tricks', 'Flexbox Guide']
            },
            {
              id: '3',
              title: 'JavaScript Fundamentals',
              description: 'Add interactivity to your websites',
              type: 'exercise',
              duration: '4 hours',
              completed: false,
              resources: ['JavaScript.info', 'Eloquent JavaScript']
            }
          ]
        },
        {
          id: '2',
          title: 'React Development',
          description: 'Build modern web applications with React',
          difficulty: 'Intermediate',
          estimatedTime: '12 weeks',
          progress: 25,
          skills: ['React', 'JSX', 'State Management', 'Hooks'],
          prerequisites: ['JavaScript', 'HTML', 'CSS'],
          modules: [
            {
              id: '1',
              title: 'React Basics',
              description: 'Introduction to React components',
              type: 'video',
              duration: '3 hours',
              completed: true,
              resources: ['React Documentation', 'React Tutorial']
            },
            {
              id: '2',
              title: 'State and Props',
              description: 'Managing component state and props',
              type: 'exercise',
              duration: '2 hours',
              completed: false,
              resources: ['State Management Guide']
            }
          ]
        }
      ];
      setLearningPaths(mockPaths);
    } catch (error) {
      console.error('Error loading learning paths:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateLearningPath = async () => {
    if (!topic.trim()) return;
    
    setGenerating(true);
    try {
      // Mock API call for demonstration
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newPath: LearningPath = {
        id: Date.now().toString(),
        title: `${topic} Learning Path`,
        description: `Comprehensive learning path for ${topic}`,
        difficulty: skillLevel as 'Beginner' | 'Intermediate' | 'Advanced',
        estimatedTime: '6-10 weeks',
        progress: 0,
        skills: [topic, 'Problem Solving', 'Best Practices'],
        prerequisites: skillLevel === 'Beginner' ? ['Basic computer skills'] : ['Programming fundamentals'],
        modules: [
          {
            id: '1',
            title: `${topic} Fundamentals`,
            description: `Learn the basics of ${topic}`,
            type: 'video',
            duration: '2 hours',
            completed: false,
            resources: [`${topic} Documentation`, `${topic} Tutorial`]
          },
          {
            id: '2',
            title: `Practical ${topic}`,
            description: `Hands-on exercises and projects`,
            type: 'exercise',
            duration: '4 hours',
            completed: false,
            resources: [`${topic} Examples`, `${topic} Projects`]
          }
        ]
      };
      
      setLearningPaths(prev => [newPath, ...prev]);
      setTopic('');
    } catch (error) {
      console.error('Error generating learning path:', error);
    } finally {
      setGenerating(false);
    }
  };

  const startPath = (path: LearningPath) => {
    setSelectedPath(path);
  };

  const markModuleComplete = (pathId: string, moduleId: string) => {
    setLearningPaths(prev => prev.map(path => {
      if (path.id === pathId) {
        const updatedModules = path.modules.map(module => 
          module.id === moduleId ? { ...module, completed: true } : module
        );
        const completedCount = updatedModules.filter(m => m.completed).length;
        const progress = Math.round((completedCount / updatedModules.length) * 100);
        
        return { ...path, modules: updatedModules, progress };
      }
      return path;
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p>Loading learning paths...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Standardized Header */}
      <DnaPageHeader 
        title="AI LEARNING PATH"
        description="Personalized learning journeys powered by AI"
      />

      {/* Generate New Path */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Generate Learning Path
          </CardTitle>
          <CardDescription>
            Create a personalized learning path based on your interests and skill level
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Topic</label>
              <Input
                placeholder="e.g., Machine Learning, React, Python"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Skill Level</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={skillLevel}
                onChange={(e) => setSkillLevel(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Time Commitment</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={timeCommitment}
                onChange={(e) => setTimeCommitment(e.target.value)}
              >
                <option value="1-2 hours/week">1-2 hours/week</option>
                <option value="3-5 hours/week">3-5 hours/week</option>
                <option value="5+ hours/week">5+ hours/week</option>
              </select>
            </div>
          </div>
          <Button 
            onClick={generateLearningPath}
            disabled={generating || !topic.trim()}
            className="w-full"
          >
            {generating ? (
              <>
                <Brain className="h-4 w-4 animate-spin mr-2" />
                Generating Path...
              </>
            ) : (
              <>
                <Target className="h-4 w-4 mr-2" />
                Generate Learning Path
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {learningPaths.map((path) => (
          <Card key={path.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{path.title}</CardTitle>
                  <CardDescription className="mt-1">{path.description}</CardDescription>
                </div>
                <Badge variant={path.difficulty === 'Beginner' ? 'secondary' : 
                              path.difficulty === 'Intermediate' ? 'default' : 'destructive'}>
                  {path.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-muted-foreground">{path.progress}%</span>
                </div>
                <Progress value={path.progress} className="h-2" />
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{path.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{path.modules.length} modules</span>
                </div>
              </div>

              {/* Skills */}
              <div>
                <p className="text-sm font-medium mb-2">Skills you'll learn:</p>
                <div className="flex flex-wrap gap-1">
                  {path.skills.slice(0, 3).map((skill) => (
                    <Badge key={skill} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {path.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{path.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => startPath(path)}
                className="w-full"
                variant={path.progress > 0 ? "default" : "outline"}
              >
                {path.progress > 0 ? (
                  <>
                    <PlayCircle className="h-4 w-4 mr-2" />
                    Continue Learning
                  </>
                ) : (
                  <>
                    <ArrowRight className="h-4 w-4 mr-2" />
                    Start Path
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Path Details Modal */}
      {selectedPath && (
        <Card className="mt-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedPath.title}</CardTitle>
              <Button variant="outline" onClick={() => setSelectedPath(null)}>
                Close
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Path Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Award className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{selectedPath.difficulty}</p>
                  <p className="text-sm text-muted-foreground">Difficulty</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{selectedPath.estimatedTime}</p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <TrendingUp className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <p className="font-medium">{selectedPath.progress}%</p>
                  <p className="text-sm text-muted-foreground">Complete</p>
                </div>
              </div>

              {/* Modules */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Learning Modules</h3>
                <div className="space-y-3">
                  {selectedPath.modules.map((module, index) => (
                    <div key={module.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <div className="flex-shrink-0">
                        {module.completed ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <div className="h-6 w-6 rounded-full border-2 border-muted-foreground flex items-center justify-center">
                            <span className="text-xs">{index + 1}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{module.title}</h4>
                        <p className="text-sm text-muted-foreground">{module.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {module.duration}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {module.type}
                          </Badge>
                        </div>
                      </div>
                      {!module.completed && (
                        <Button 
                          size="sm"
                          onClick={() => markModuleComplete(selectedPath.id, module.id)}
                        >
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {learningPaths.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Learning Paths Yet</h3>
            <p className="text-muted-foreground mb-4">
              Generate your first AI-powered learning path to get started
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default AILearningPathPage;