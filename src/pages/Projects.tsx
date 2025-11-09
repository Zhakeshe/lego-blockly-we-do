import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, FolderOpen, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Project {
  id: string;
  name: string;
  created: Date;
  modified: Date;
  workspace?: string;
}

const Projects = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = () => {
    const savedProjects = localStorage.getItem("wedo_projects");
    if (savedProjects) {
      const parsed = JSON.parse(savedProjects);
      setProjects(parsed.map((p: any) => ({
        ...p,
        created: new Date(p.created),
        modified: new Date(p.modified),
      })));
    }
  };

  const saveProjects = (updatedProjects: Project[]) => {
    localStorage.setItem("wedo_projects", JSON.stringify(updatedProjects));
    setProjects(updatedProjects);
  };

  const createProject = () => {
    if (!newProjectName.trim()) {
      toast.error(t("error.noSavedProgram"));
      return;
    }

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      created: new Date(),
      modified: new Date(),
    };

    const updatedProjects = [...projects, newProject];
    saveProjects(updatedProjects);
    setNewProjectName("");
    setShowNewDialog(false);
    
    // Automatically open the new project
    openProject(newProject);
  };

  const deleteProject = (id: string) => {
    const updatedProjects = projects.filter((p) => p.id !== id);
    saveProjects(updatedProjects);
    
    // Also remove project workspace if it's the current one
    const currentProject = localStorage.getItem("current_project_id");
    if (currentProject === id) {
      localStorage.removeItem("current_project_id");
      localStorage.removeItem("wedo_workspace");
    }
    
    toast.success(t("success.saved"));
  };

  const openProject = (project: Project) => {
    localStorage.setItem("current_project_id", project.id);
    if (project.workspace) {
      localStorage.setItem("wedo_workspace", project.workspace);
    } else {
      localStorage.removeItem("wedo_workspace");
    }
    // Navigate to the new Editor page with project ID
    navigate(`/editor/${project.id}`);
    toast.success(t("success.loaded"));
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <div className="min-h-screen bg-bg">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text1">{t("projects.title")}</h1>
            <p className="text-text3 mt-2">{t("app.subtitle")}</p>
          </div>
          <Button onClick={() => setShowNewDialog(true)} size="lg">
            <Plus className="w-5 h-5 mr-2" />
            {t("projects.new")}
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-16">
              <FolderOpen className="w-16 h-16 text-text4 mb-4" />
              <h3 className="text-xl font-semibold text-text2 mb-2">
                {t("projects.empty")}
              </h3>
              <p className="text-text4 mb-6">{t("projects.create")}</p>
              <Button onClick={() => setShowNewDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                {t("projects.new")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:border-borderH1 transition-colors">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{project.name}</span>
                  </CardTitle>
                  <CardDescription className="flex items-center gap-2 text-xs">
                    <Calendar className="w-3 h-3" />
                    {formatDate(project.modified)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => openProject(project)}
                      className="flex-1"
                      variant="default"
                    >
                      <FolderOpen className="w-4 h-4 mr-2" />
                      {t("projects.open")}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {t("projects.delete")} "{project.name}"?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {t("workspace.info")}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("control.stop")}</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteProject(project.id)}>
                            {t("projects.delete")}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("projects.new")}</DialogTitle>
              <DialogDescription>{t("projects.name")}</DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="project-name">{t("projects.name")}</Label>
              <Input
                id="project-name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder={t("projects.name")}
                className="mt-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    createProject();
                  }
                }}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewDialog(false)}>
                {t("control.stop")}
              </Button>
              <Button onClick={createProject}>{t("projects.new")}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Projects;
