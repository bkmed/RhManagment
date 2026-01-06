import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Image,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { teamsDb } from '../../database/teamsDb';
import { employeesDb } from '../../database/employeesDb';
import { Team, Employee } from '../../database/schema';
import { Theme } from '../../theme';

export const MyTeamScreen = () => {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { user } = useAuth();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [team, setTeam] = useState<Team | null>(null);
  const [, setManager] = useState<Employee | null>(null);
  const [members, setMembers] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeamData();
  }, [user?.teamId]);

  const loadTeamData = async () => {
    if (!user?.teamId) {
      setLoading(false);
      return;
    }

    try {
      const teamData = await teamsDb.getById(user.teamId);
      setTeam(teamData || null);

      if (teamData) {
        // Fetch Manager
        if (teamData.managerId) {
          const managerData = await employeesDb.getById(teamData.managerId);
          setManager(managerData || null);
        }

        // Fetch Members
        const allEmployees = await employeesDb.getAll();
        const teamMembers = allEmployees.filter(e => e.teamId === teamData.id);
        setMembers(teamMembers);
      }
    } catch (error) {
      console.error('Error loading my team:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMember = ({ item }: { item: Employee }) => (
    <View style={styles.memberCard}>
      <View style={styles.avatarContainer}>
        {item.photoUri ? (
          <Image source={{ uri: item.photoUri }} style={styles.avatar} />
        ) : (
          <View
            style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
          >
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}
      </View>
      <View style={styles.memberInfo}>
        <Text style={styles.memberName}>{item.name}</Text>
        <Text style={styles.memberRole}>
          {item.id === team?.managerId
            ? `👑 ${t('teams.manager')}`
            : item.position || t('common.employee')}
        </Text>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (!team) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={styles.emptyText}>
          {t('teams.noTeamAssigned') || 'You are not assigned to any team.'}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Team Header */}
        <View style={styles.headerCard}>
          <Text style={styles.teamName}>{team.name}</Text>
          <View style={styles.badgeContainer}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>🏢 {team.department}</Text>
            </View>
            {team.service && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: theme.colors.secondary },
                ]}
              >
                <Text style={styles.badgeText}>⚙️ {team.service}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Team Members List */}
        <Text style={styles.sectionTitle}>
          {t('teams.members')} ({members.length})
        </Text>
        <FlatList
          data={members}
          renderItem={renderMember}
          keyExtractor={item => item.id?.toString() || Math.random().toString()}
          scrollEnabled={false} // Since we are inside a ScrollView
        />
      </ScrollView>
    </View>
  );
};

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.colors.background,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
    },
    scrollContent: {
      padding: theme.spacing.m,
    },
    headerCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: 16,
      padding: theme.spacing.l,
      marginBottom: theme.spacing.l,
      alignItems: 'center',
      ...theme.shadows.medium,
    },
    teamName: {
      ...theme.textVariants.header,
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
      textAlign: 'center',
    },
    badgeContainer: {
      flexDirection: 'row',
      gap: theme.spacing.s,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    badge: {
      backgroundColor: theme.colors.primary + '20',
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.s,
      borderRadius: 20,
    },
    badgeText: {
      color: theme.colors.text,
      fontWeight: '600',
    },
    sectionTitle: {
      ...theme.textVariants.subheader,
      color: theme.colors.text,
      marginBottom: theme.spacing.m,
      marginLeft: theme.spacing.s,
    },
    memberCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.s,
      borderRadius: 12,
      ...theme.shadows.small,
    },
    avatarContainer: {
      marginRight: theme.spacing.m,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: '#FFF',
      fontWeight: 'bold',
      fontSize: 20,
    },
    memberInfo: {
      flex: 1,
    },
    memberName: {
      ...theme.textVariants.body,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    memberRole: {
      ...theme.textVariants.caption,
      color: theme.colors.subText,
      marginTop: 2,
    },
    emptyText: {
      ...theme.textVariants.body,
      color: theme.colors.subText,
      textAlign: 'center',
    },
  });
