import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, FileText, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useArticleSearch } from '@/hooks/useArticleSearch';
import { Skeleton } from '@/components/ui/skeleton';

interface SearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SearchDialog = ({ open, onOpenChange }: SearchDialogProps) => {
  const navigate = useNavigate();
  const { searchQuery, setSearchQuery, searchResults, isLoading } = useArticleSearch();

  const handleArticleClick = (articleId: string) => {
    navigate(`/article/${articleId}`);
    onOpenChange(false);
    setSearchQuery('');
  };

  const handleClose = () => {
    onOpenChange(false);
    setSearchQuery('');
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Search Articles
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by title, author, keywords, or abstract..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto mt-4 space-y-2 min-h-[200px]">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : searchQuery.trim() === '' ? (
            <div className="text-center text-muted-foreground py-8">
              <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Start typing to search articles...</p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No articles found for "{searchQuery}"</p>
            </div>
          ) : (
            searchResults.map((article: any) => (
              <button
                key={article.id}
                onClick={() => handleArticleClick(article.id)}
                className="w-full text-left p-4 rounded-lg border bg-card hover:bg-accent transition-colors"
              >
                <h3 className="font-medium text-foreground line-clamp-2 mb-1">
                  {article.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-2">
                  {article.authors?.map((a: any) => a.name).join(', ')}
                </p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {article.issues?.journals?.title && (
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                      {article.issues.journals.title}
                    </span>
                  )}
                  {article.issues && (
                    <span>
                      Vol. {article.issues.volume}, Issue {article.issues.issue_number} ({article.issues.year})
                    </span>
                  )}
                </div>
                {article.keywords?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {article.keywords.slice(0, 3).map((keyword: string, idx: number) => (
                      <span key={idx} className="text-xs bg-muted px-2 py-0.5 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                )}
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SearchDialog;
