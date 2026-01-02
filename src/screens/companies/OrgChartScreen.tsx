import React, { useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    Dimensions,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { useTheme } from '../../context/ThemeContext';
import { RootState } from '../../store';
import { Employee } from '../../database/schema';
import { useNavigation } from '@react-navigation/native';
import { Theme } from '../../theme';

const { width } = Dimensions.get('window');

export const OrgChartScreen = () => {
    const { theme } = useTheme();
    const { t } = useTranslation();
    const navigation = useNavigation<any>();
    const styles = useMemo(() => createStyles(theme), [theme]);

    const employees = useSelector((state: RootState) => state.employees.items);
    const teams = useSelector((state: RootState) => state.teams.items);

    const hierarchy = useMemo(() => {
        const admin = employees.find((e: Employee) => e.role === 'admin');
        if (!admin) return null;

        const managers = employees.filter((e: Employee) => e.role === 'chef_dequipe');

        return {
            ...admin,
            children: managers.map((manager: Employee) => ({
                ...manager,
                children: employees.filter((e: Employee) => e.role === 'employee' && e.teamId === manager.teamId)
            }))
        };
    }, [employees]);

    const renderNode = (emp: any, level: number = 0) => {
        return (
            <View key={emp.id} style={[styles.nodeContainer, { marginLeft: level * 20 }]}>
                {level > 0 && <View style={styles.connector} />}
                <TouchableOpacity
                    style={[styles.card, level === 0 && styles.adminCard, level === 1 && styles.managerCard]}
                    onPress={() => navigation.navigate('Employees', { screen: 'EmployeeDetails', params: { id: emp.id } })}
                >
                    <View style={styles.cardHeader}>
                        <View style={styles.avatarPlaceholder}>
                            <Text style={styles.avatarText}>{emp.name.substring(0, 1)}</Text>
                        </View>
                        <View style={styles.info}>
                            <Text style={styles.name}>{emp.name}</Text>
                            <Text style={styles.position}>{emp.position || emp.role}</Text>
                        </View>
                    </View>
                </TouchableOpacity>

                {emp.children && emp.children.length > 0 && (
                    <View style={styles.childrenContainer}>
                        {emp.children.map((child: any) => renderNode(child, level + 1))}
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>{t('navigation.orgChart') || 'Organigramme'}</Text>
                <Text style={styles.subtitle}>Structure hiérarchique de l'entreprise</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} horizontal>
                <ScrollView contentContainerStyle={styles.verticalScroll}>
                    {hierarchy ? renderNode(hierarchy) : (
                        <Text style={styles.emptyText}>{t('common.noData')}</Text>
                    )}
                </ScrollView>
            </ScrollView>
        </View>
    );
};

const createStyles = (theme: Theme) => StyleSheet.create({
    container: {
        backgroundColor: theme.colors.background,
    },
    header: {
        padding: theme.spacing.m,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        ...theme.textVariants.header,
        fontSize: 20,
    },
    subtitle: {
        ...theme.textVariants.caption,
        color: theme.colors.subText,
    },
    scrollContent: {
        padding: theme.spacing.m,
    },
    verticalScroll: {
        paddingBottom: 40,
    },
    nodeContainer: {
        position: 'relative',
        marginBottom: theme.spacing.m,
    },
    connector: {
        position: 'absolute',
        left: -15,
        top: 0,
        bottom: 30,
        width: 2,
        backgroundColor: theme.colors.border,
    },
    card: {
        backgroundColor: theme.colors.surface,
        padding: theme.spacing.m,
        borderRadius: theme.spacing.s,
        width: 240,
        ...theme.shadows.small,
        borderLeftWidth: 4,
        borderLeftColor: theme.colors.subText,
    },
    adminCard: {
        borderLeftColor: theme.colors.primary,
        borderLeftWidth: 6,
    },
    managerCard: {
        borderLeftColor: theme.colors.secondary,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarPlaceholder: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.border,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing.m,
    },
    avatarText: {
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    info: {
        flex: 1,
    },
    name: {
        fontSize: 14,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    position: {
        fontSize: 12,
        color: theme.colors.subText,
    },
    childrenContainer: {
        marginTop: theme.spacing.m,
    },
    emptyText: {
        padding: 20,
        color: theme.colors.subText,
    }
});
