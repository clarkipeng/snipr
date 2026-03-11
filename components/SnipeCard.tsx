import type { Schema } from '@/amplify/data/resource';
import { getCachedUrl } from '@/utils/url-cache';
import { LinearGradient } from 'expo-linear-gradient';
import { generateClient } from 'aws-amplify/data';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ReactionPicker } from './ReactionPicker';
import { ReactionBar } from './ReactionBar';

const client = generateClient<Schema>();

type Comment = {
  id: string;
  content: string;
  userName: string;
  userProfilePicture: string | null;
  createdAt: string;
};

type Reaction = {
  emoji: string;
  count: number;
  userIds: string[];
  hasReacted: boolean;
};

type SnipeCardProps = {
  snipeId: string;
  sniperName: string;
  targetName: string;
  sniperProfilePictureUrl: string | null;
  imageUrl: string | null;
  caption: string | null;
  createdAt: string;
  currentUserId: string | null;
  userMap: Map<string, { id: string; name: string; email?: string; profilePicture?: string | null }>;
};

function formatTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

function SniperAvatar({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return <Image source={{ uri: url }} style={styles.sniperAvatar} />;
  }
  return (
    <View style={[styles.sniperAvatar, styles.sniperAvatarPlaceholder]}>
      <Text style={styles.sniperAvatarInitial}>
        {name.charAt(0).toUpperCase()}
      </Text>
    </View>
  );
}

export function SnipeCard({
  snipeId,
  sniperName,
  targetName,
  sniperProfilePictureUrl,
  imageUrl,
  caption,
  createdAt,
  currentUserId,
  userMap,
}: SnipeCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [expanded, setExpanded] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [loadingComments, setLoadingComments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentCount, setCommentCount] = useState<number | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [loadingReactions, setLoadingReactions] = useState(false);

  const onPressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const onPressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const loadComments = useCallback(async () => {
    setLoadingComments(true);
    try {
      const { data } = await client.models.SnipeComment.list({
        filter: { snipeId: { eq: snipeId } },
        limit: 50,
      });
      const sorted = [...data].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      // #region agent log
      fetch('http://127.0.0.1:7897/ingest/0e95db31-a5bc-4ad5-9951-34c58685161d',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'57a908'},body:JSON.stringify({sessionId:'57a908',location:'SnipeCard.tsx:loadComments',message:'comment data and userMap',data:{comments:sorted.map((c:any)=>({id:c.id,userId:c.userId,content:c.content})),userMapKeys:[...userMap.keys()],userMapSize:userMap.size},timestamp:Date.now()})}).catch(()=>{});
      // #endregion
      const mapped: Comment[] = await Promise.all(sorted.map(async (c) => {
        const u = userMap.get(c.userId);
        const displayName = u?.name || u?.email?.split('@')[0] || 'Unknown';
        const profilePicPath = u?.profilePicture;
        const profilePicUrl = profilePicPath ? await getCachedUrl(profilePicPath) : null;
        return {
          id: c.id,
          content: c.content,
          userName: displayName,
          userProfilePicture: profilePicUrl,
          createdAt: c.createdAt
        };
      }));
      setComments(mapped);
      setCommentCount(mapped.length);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setLoadingComments(false);
    }
  }, [snipeId, userMap]);

  const toggleComments = () => {
    if (!expanded) {
      loadComments();
    }
    setExpanded((prev) => !prev);
  };

  const submitComment = async () => {
    const text = commentText.trim();
    if (!text || !currentUserId) return;
    setSubmitting(true);
    try {
      const { data: newComment } = await client.models.SnipeComment.create({
        snipeId,
        userId: currentUserId,
        content: text,
      });
      if (newComment) {
        const currentUser = userMap.get(currentUserId);
        const profilePicPath = currentUser?.profilePicture;
        const profilePicUrl = profilePicPath ? await getCachedUrl(profilePicPath) : null;

        const entry: Comment = {
          id: newComment.id,
          content: newComment.content,
          userName: currentUser?.name || currentUser?.email?.split('@')[0] || 'You',
          userProfilePicture: profilePicUrl,
          createdAt: newComment.createdAt,
        };
        setComments((prev) => [...prev, entry]);
        setCommentCount((prev) => (prev ?? 0) + 1);
      }
      setCommentText('');
    } catch (err) {
      console.error('Failed to post comment:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const loadReactions = useCallback(async () => {
    setLoadingReactions(true);
    try {
      const { data } = await client.models.SnipeReaction.list({
        filter: { snipeId: { eq: snipeId } },
        limit: 100,
      });

      const grouped = new Map<string, { userIds: string[]; reactionIds: string[] }>();
      data.forEach((r) => {
        if (!grouped.has(r.emoji)) {
          grouped.set(r.emoji, { userIds: [], reactionIds: [] });
        }
        grouped.get(r.emoji)!.userIds.push(r.userId);
        grouped.get(r.emoji)!.reactionIds.push(r.id);
      });

      const mapped: Reaction[] = Array.from(grouped.entries()).map(([emoji, info]) => ({
        emoji,
        count: info.userIds.length,
        userIds: info.userIds,
        hasReacted: currentUserId ? info.userIds.includes(currentUserId) : false,
      }));

      setReactions(mapped);
    } catch (err) {
      console.error('Failed to load reactions:', err);
    } finally {
      setLoadingReactions(false);
    }
  }, [snipeId, currentUserId]);

  useEffect(() => {
    loadReactions();
  }, [loadReactions]);

  const handleReactionSelect = async (emoji: string) => {
    if (!currentUserId) return;
    setShowReactionPicker(false);

    const existingReaction = reactions.find((r) => r.emoji === emoji && r.hasReacted);

    if (existingReaction) {
      try {
        const { data: allReactions } = await client.models.SnipeReaction.list({
          filter: { snipeId: { eq: snipeId }, emoji: { eq: emoji }, userId: { eq: currentUserId } },
        });
        if (allReactions.length > 0) {
          await client.models.SnipeReaction.delete({ id: allReactions[0].id });
          await loadReactions();
        }
      } catch (err) {
        console.error('Failed to remove reaction:', err);
      }
    } else {
      try {
        await client.models.SnipeReaction.create({
          snipeId,
          userId: currentUserId,
          emoji,
        });
        await loadReactions();
      } catch (err) {
        console.error('Failed to add reaction:', err);
      }
    }
  };

  const handleReactionPress = async (emoji: string) => {
    if (!currentUserId) return;

    const reaction = reactions.find((r) => r.emoji === emoji);
    if (!reaction) return;

    if (reaction.hasReacted) {
      try {
        const { data: allReactions } = await client.models.SnipeReaction.list({
          filter: { snipeId: { eq: snipeId }, emoji: { eq: emoji }, userId: { eq: currentUserId } },
        });
        if (allReactions.length > 0) {
          await client.models.SnipeReaction.delete({ id: allReactions[0].id });
          await loadReactions();
        }
      } catch (err) {
        console.error('Failed to remove reaction:', err);
      }
    } else {
      try {
        await client.models.SnipeReaction.create({
          snipeId,
          userId: currentUserId,
          emoji,
        });
        await loadReactions();
      } catch (err) {
        console.error('Failed to add reaction:', err);
      }
    }
  };

  return (
    <Animated.View style={[styles.cardOuter, { transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        style={styles.card}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
      >
        <View style={styles.header}>
          <SniperAvatar url={sniperProfilePictureUrl} name={sniperName} />
          <Text style={styles.names} numberOfLines={2}>
            <Text style={styles.sniperName}>{sniperName}</Text>
            <Text style={styles.actionText}> sniped </Text>
            <Text style={styles.targetName}>{targetName}</Text>
          </Text>
          <Text style={styles.time}>{formatTime(createdAt)}</Text>
        </View>

        {imageUrl && (
          <View>
            <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
            {caption && (
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.7)']}
                style={styles.imageGradient}
              />
            )}
          </View>
        )}

        {caption && (
          <View style={styles.captionContainer}>
            <Text style={styles.caption}>{caption}</Text>
          </View>
        )}
      </Pressable>

      <View style={styles.reactionSection}>
        <ReactionBar
          reactions={reactions}
          onReactionPress={handleReactionPress}
          onAddPress={() => setShowReactionPicker(!showReactionPicker)}
        />
        {showReactionPicker && (
          <View style={styles.reactionPickerContainer}>
            <ReactionPicker
              visible={showReactionPicker}
              onReactionSelect={handleReactionSelect}
            />
          </View>
        )}
      </View>

      <Pressable onPress={toggleComments} style={styles.commentToggle}>
        <Text style={styles.commentToggleText}>
          {expanded
            ? 'Hide comments'
            : commentCount != null
              ? `${commentCount} comment${commentCount !== 1 ? 's' : ''}`
              : 'Comments'}
        </Text>
      </Pressable>

      {expanded && (
        <View style={styles.commentsSection}>
          {loadingComments ? (
            <ActivityIndicator color="#FF3B30" size="small" style={{ paddingVertical: 8 }} />
          ) : comments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet — be the first to roast!</Text>
          ) : (
            comments.map((c) => (
              <View key={c.id} style={styles.commentRow}>
                {c.userProfilePicture ? (
                  <Image source={{ uri: c.userProfilePicture }} style={styles.commentAvatar} />
                ) : (
                  <View style={[styles.commentAvatar, styles.commentAvatarPlaceholder]}>
                    <Text style={styles.commentAvatarInitial}>
                      {c.userName.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={styles.commentContent}>
                  <Text style={styles.commentText}>
                    <Text style={styles.commentAuthor}>{c.userName}</Text>
                    {'  '}
                    {c.content}
                  </Text>
                  <Text style={styles.commentTime}>{formatTime(c.createdAt)}</Text>
                </View>
              </View>
            ))
          )}

          <View style={styles.commentInputRow}>
            <TextInput
              style={styles.commentInput}
              placeholder="Drop a comment..."
              placeholderTextColor="rgba(255,255,255,0.3)"
              value={commentText}
              onChangeText={setCommentText}
              onSubmitEditing={submitComment}
              returnKeyType="send"
              editable={!submitting}
            />
            <Pressable
              onPress={submitComment}
              disabled={submitting || !commentText.trim()}
              style={[
                styles.sendButton,
                (!commentText.trim() || submitting) && styles.sendButtonDisabled,
              ]}
            >
              <Text style={styles.sendButtonText}>{submitting ? '...' : 'Send'}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardOuter: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#15151B',
    borderRadius: 18,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 12,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  sniperAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    flexShrink: 0,
  },
  sniperAvatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sniperAvatarInitial: {
    fontSize: 13,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
  },
  names: {
    flex: 1,
    marginRight: 8,
  },
  sniperName: {
    fontWeight: '800',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.3,
  },
  actionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  targetName: {
    fontWeight: '800',
    fontSize: 14,
    color: '#fff',
    letterSpacing: 0.3,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '500',
    flexShrink: 0,
  },
  image: {
    width: '100%',
    aspectRatio: 4 / 3,
    backgroundColor: '#0B0B0F',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
  },
  captionContainer: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    color: 'rgba(255,255,255,0.8)',
  },
  commentToggle: {
    backgroundColor: '#15151B',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  commentToggleText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.45)',
  },
  commentsSection: {
    backgroundColor: '#111117',
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  noComments: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.3)',
    paddingVertical: 10,
    fontStyle: 'italic',
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 6,
    gap: 10,
  },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    marginTop: 2,
  },
  commentAvatarPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarInitial: {
    fontSize: 11,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.6)',
  },
  commentContent: {
    flex: 1,
    gap: 2,
  },
  commentText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.75)',
    lineHeight: 18,
  },
  commentAuthor: {
    fontWeight: '700',
    color: '#fff',
  },
  commentTime: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingTop: 8,
  },
  commentInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    color: '#fff',
  },
  sendButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  sendButtonDisabled: {
    opacity: 0.35,
  },
  sendButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#fff',
  },
  reactionSection: {
    backgroundColor: '#15151B',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255,255,255,0.08)',
    position: 'relative',
  },
  reactionPickerContainer: {
    paddingHorizontal: 14,
    paddingBottom: 8,
  },
});
