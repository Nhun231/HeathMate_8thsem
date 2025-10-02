import React, { useState } from 'react';
import {
    Container,
    Typography,
    TextField,
    MenuItem,
    Button,
    Paper,
    Box,
    Divider
} from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { createDietPlan } from '../../services/DietPlan';
import CustomAlert from '../common/Alert';
import { translateErrorCode, extractBackendErrorCode } from '../../utils/errorTranslations';

const DietPlan = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const [goal, setGoal] = useState(location.state?.goal || '');
    const [weightChange, setWeightChange] = useState('');
    const [result, setResult] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    const handleNavigate = () => navigate('/customer-homepage');

    const handleSubmit = async () => {
        try {
            setErrorMsg('');
            const token = localStorage.getItem('accessToken');

            const payload = {
                goal,
                ...(goal !== 'MaintainWeight' && {
                    targetWeightChange: Number(weightChange),
                }),
            };

            const { data } = await createDietPlan(payload, token);

            const { dailyCalories, durationDays } = data;
            const finalDuration = durationDays === 0 ? 30 : durationDays;

            setResult({
                calories: dailyCalories,
                duration: finalDuration,
                message:
                    `Để đạt mục tiêu an toàn và hiệu quả, hãy kiên trì trong ít nhất ${finalDuration} ngày.\n\n` +
                    `Mức thay đổi calo mỗi ngày không nên vượt quá 500 calo/ngày.\n\n` +
                    `Hãy đồng hành cùng HealthMate để đạt mục tiêu một cách bền vững!`,
            });
        } catch (error) {
            const code = extractBackendErrorCode(error);
            const friendly =
                translateErrorCode(code) ||
                'Đã xảy ra lỗi. Vui lòng thử lại sau.';
            setErrorMsg(friendly);
            console.error('DietPlan error:', error);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 8 }}>
            <Paper
                elevation={6}
                sx={{ borderRadius: 4, p: 5, bgcolor: '#fafafa', mb: 7 }}
            >
                <Typography
                    variant="h4"
                    align="center"
                    fontWeight="bold"
                    color="#4CAF50"
                    mb={3}
                >
                    Kế Hoạch Dinh Dưỡng Cá Nhân
                </Typography>

                {/* Hiển thị alert khi có lỗi */}
                {errorMsg && (
                    <Box mb={3}>
                        <CustomAlert
                            message={errorMsg}
                            variant="error"
                            onClose={() => setErrorMsg('')}
                        />
                    </Box>
                )}

                <Typography align="center" mb={4} sx={{ color: '#666' }}>
                    Hãy chọn mục tiêu và cân nặng mong muốn để SmartDiet gợi ý
                    kế hoạch phù hợp!
                </Typography>

                <Box display="flex" flexDirection="column" gap={3}>
                    <TextField
                        select
                        label="Mục tiêu"
                        fullWidth
                        value={goal}
                        onChange={(e) => setGoal(e.target.value)}
                    >
                        <MenuItem value="LoseWeight">Giảm cân</MenuItem>
                        <MenuItem value="MaintainWeight">
                            Giữ nguyên cân nặng
                        </MenuItem>
                        <MenuItem value="GainWeight">Tăng cân</MenuItem>
                    </TextField>

                    {goal !== 'MaintainWeight' && (
                        <TextField
                            label="Số cân nặng cần thay đổi (kg)"
                            type="number"
                            fullWidth
                            value={weightChange}
                            onChange={(e) => setWeightChange(e.target.value)}
                        />
                    )}

                    <Button
                        variant="contained"
                        color="success"
                        fullWidth
                        sx={{
                            borderRadius: 50,
                            py: 1.5,
                            fontWeight: 'bold',
                            fontSize: 16,
                            backgroundColor: '#4CAF50',
                            '&:hover': { backgroundColor: '#388E3C' },
                            mt: 2,
                        }}
                        onClick={handleSubmit}
                        disabled={
                            !goal ||
                            (goal !== 'MaintainWeight' && !weightChange)
                        }
                    >
                        Tạo kế hoạch
                    </Button>
                </Box>

                {result && (
                    <>
                        <Divider sx={{ my: 4 }} />
                        <Box
                            sx={{
                                p: 3,
                                borderRadius: 3,
                                bgcolor: '#e8f5e9',
                                boxShadow:
                                    '0 4px 12px rgba(76, 175, 80, 0.2)',
                            }}
                        >
                            <Typography
                                variant="h5"
                                align="center"
                                fontWeight="bold"
                                color="#2e7d32"
                                mb={2}
                            >
                                Kế hoạch dinh dưỡng của bạn:
                            </Typography>

                            <Typography
                                align="center"
                                fontSize={36}
                                fontWeight="bold"
                                color="#FF5722"
                                mb={2}
                            >
                                {result.calories} calo/ngày
                            </Typography>

                            {/* Hiển thị thời gian nếu không phải giữ cân */}
                            {goal !== 'MaintainWeight' && result.duration && (
                                <Typography
                                    align="center"
                                    fontSize={20}
                                    fontWeight="600"
                                    color="#4CAF50"
                                    mb={3}
                                >
                                    Thời gian: {result.duration} ngày
                                </Typography>
                            )}

                            <Typography
                                sx={{
                                    whiteSpace: 'pre-line',
                                    color: '#555',
                                    lineHeight: 1.8,
                                    fontSize: 16,
                                    fontWeight: 500,
                                    textAlign: 'left',
                                    padding: '16px',
                                    background: '#f0fff0',
                                    borderRadius: '12px',
                                    border: '1px dashed #4CAF50',
                                }}
                            >
                                {result.message}
                            </Typography>
                        </Box>
                    </>
                )}

                <Button
                    variant="contained"
                    color="success"
                    fullWidth
                    onClick={handleNavigate}
                    sx={{
                        borderRadius: 50,
                        py: 1.5,
                        fontWeight: 'bold',
                        fontSize: 16,
                        backgroundColor: '#4CAF50',
                        '&:hover': { backgroundColor: '#388E3C' },
                        mt: 5,
                    }}
                    disabled={
                        !goal ||
                        (goal !== 'MaintainWeight' && !weightChange)
                    }
                >
                    Xem nhật ký hôm nay
                </Button>
            </Paper>
        </Container>
    );
};

export default DietPlan;
